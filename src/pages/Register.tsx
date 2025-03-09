import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthAPI } from "../utils/api-helper";
import { useServerKey } from "../hooks/useServerKey";
import { ArrowLeftCircleFill } from "react-bootstrap-icons";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { ErrorMessage } from "../components/ErrorMessge";
import { AxiosError, AxiosResponse } from "axios";
import { IncomingErrorResponseDataType } from "../types";
import { Alert } from "react-bootstrap";

type FormValues = {
  username: string;
  email: string;
  otp: string;
};

const validationRules = {
  username: {
    required: "Please enter a username",
    pattern: {
      value: /^(?![0-9_]*$)[A-Z0-9_]+$/i,
      message: "Letters with numbers and '_' are allowed only",
    },
    maxLength: {
      value: 20,
      message: "Maximum 20 characters allowed for username",
    },
  },
  email: {
    required: "Please enter an Email address",
    pattern: {
      value:
        /^(?=[a-zA-Z0-9][a-zA-Z0-9@._%+-]{5,253}$)[a-zA-Z0-9._%+-]{1,64}@(?:(?=[a-zA-Z0-9-]{1,63}\.)[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\.){1,8}[a-zA-Z]{2,63}$/i,
      message: "Please enter a valid e-mail",
    },
  },
  password: {
    required: "Please enter a password",
    minLength: {
      value: 6,
      message: "Password should be minimum 6 characters",
    },
    maxLength: {
      value: 32,
      message: "Maximum 32 0haracters",
    },
  },
  otp: {
    required: "Please enter the OTP you received",
    pattern: { value: /^[0-9]{6}$/, message: "Invalid OTP" },
  },
};

const RegisterView = () => {
  const { authDispatcher, authLoading } = useAuth();
  const [serverKey, setKey] = useServerKey();

  const [stage, setStage] = useState("0");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormValues>();

  const navigate = useNavigate();

  function handleFieldError(err: AxiosError) {
    const errResData = err.response?.data as IncomingErrorResponseDataType;
    if (
      Array.isArray(errResData.errorData) &&
      errResData.errorData.length > 0
    ) {
      errResData.errorData.forEach((field) => {
        setError(field.path, { type: "custom", message: field.msg });
      });
    } else {
      setError("root.serverError", {
        type: "serverError",
        message: errResData.msg,
      });
    }
  }

  const submitData: SubmitHandler<FieldValues> = async (data) => {
    clearErrors();
    if (stage === "0") {
      const [res, err] = (await authDispatcher(
        AuthAPI.register,
        {
          ...data,
          serverKey,
        },
        stage
      )) as [AxiosResponse, AxiosError];

      if (err && err instanceof AxiosError) {
        handleFieldError(err);
      } else if (res && !res?.data.error) {
        setStage("2");
        setKey(res.data.serverKey);
      }
    } else if (stage === "2") {
      const [res, err] = (await authDispatcher(
        AuthAPI.register,
        {
          ...data,
          serverKey,
        },
        stage
      )) as [AxiosResponse, AxiosError];

      if (err && err instanceof AxiosError) {
        handleFieldError(err);
      } else if (res && !res?.data.error) {
        navigate("/");
      }
    }
  };

  return (
    <>
      <h2 className="text-center mb-5">Register</h2>
      {errors?.root?.serverError && (
        <Alert variant="danger" dismissible className="w-50 mx-auto">
          {errors.root.serverError.message || "Refresh the page, and try again"}
        </Alert>
      )}
      <form
        className="w-50 mx-auto"
        method="post"
        onSubmit={handleSubmit(submitData)}
      >
        <div className={`${stage !== "0" && "d-none"}`}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className={`form-control ${errors?.username && "is-invalid"}`}
              id="username"
              aria-describedby="nameHelp"
              {...register(
                "username",
                stage === "0" ? validationRules.username : {}
              )}
              defaultValue=""
            />
            {errors?.username && (
              <ErrorMessage message={errors?.username.message as string} />
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className={`form-control ${errors?.email && "is-invalid"}`}
              id="email"
              aria-describedby="emailHelp"
              {...register("email", stage === "0" ? validationRules.email : {})}
              defaultValue=""
            />
            {errors?.email && (
              <ErrorMessage message={errors?.email.message as string} />
            )}
          </div>
          <div className="mb-3">
            <p>
              Already registered? <Link to={"/auth"}>Login here!</Link>
            </p>
          </div>
        </div>
        <div className={`${stage !== "2" && "d-none"}`}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Enter OTP sent to your e-mail
            </label>
            <input
              type="text"
              className={`form-control ${errors?.otp && "is-invalid"}`}
              id="otp"
              aria-describedby="nameHelp"
              {...register("otp", stage === "2" ? validationRules.otp : {})}
              defaultValue=""
            />
            {errors?.otp && (
              <ErrorMessage message={errors?.otp.message as string} />
            )}
          </div>
          {/* <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Create new password
            </label>
            <input
              type="password"
              className={`form-control ${errors?.password && "is-invalid"}`}
              id="password"
              {...register(
                "password",
                stage === "2" ? validationRules.password : {}
              )}
              defaultValue=""
            />
            {errors?.password && (
              <ErrorMessage message={errors?.password.message as string} />
            )}
          </div> */}
        </div>
        <button type="submit" className="btn btn-primary w-100">
          {authLoading ? "Processing..." : stage === "0" ? "Next" : "Submit"}
        </button>
        <div className="my-3">
          <p>
            <Link to={".."} className="text-decoration-none text-secondary">
              <ArrowLeftCircleFill /> &nbsp;Back
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default RegisterView;
