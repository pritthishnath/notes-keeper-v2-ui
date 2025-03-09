import { Link, useNavigate } from "react-router-dom";
import { AuthAPI } from "../utils/api-helper";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeftCircleFill } from "react-bootstrap-icons";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "../components/ErrorMessge";
import { AxiosError, AxiosResponse } from "axios";
import { IncomingErrorResponseDataType } from "../types";
import { Alert, Button } from "react-bootstrap";
import { useServerKey } from "../hooks/useServerKey";
import { useState } from "react";

const validationRules = {
  otp: {
    required: "Please enter the OTP you received",
    pattern: { value: /^[0-9]{6}$/, message: "Invalid OTP" },
  },
};

const LoginView = () => {
  const { authDispatcher, authLoading } = useAuth();
  const [serverKey, setKey] = useServerKey();
  const [stage, setStage] = useState("1");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

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
    if (stage === "1") {
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
      <h2 className="text-center mb-5">Login</h2>
      {errors?.root?.serverError && (
        <Alert variant="danger" dismissible className="w-50 mx-auto">
          {errors.root.serverError.message || "Refresh the page, and try again"}
        </Alert>
      )}
      <form
        className="w-50 mx-auto needs-validation"
        method="post"
        onSubmit={handleSubmit(submitData)}
      >
        <div className={`mb-3 ${stage !== "1" && "d-none"}`}>
          <label htmlFor="email" className="form-label">
            Email address or Username
          </label>
          <input
            type="username"
            className={`form-control ${errors?.username && "is-invalid"}`}
            id="username"
            aria-describedby="emailHelp"
            {...register(
              "username",
              stage === "1" ? { required: "Email or username is required" } : {}
            )}
          />
          {errors?.username && (
            <ErrorMessage message={errors?.username.message as string} />
          )}
        </div>

        <div className={`mb-3 ${stage !== "2" && "d-none"}`}>
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
            Password
          </label>
          <input
            type="password"
            className={`form-control ${errors?.password && "is-invalid"}`}
            id="password"
            // {...register("password", { required: "Enter your password" })}
            {...register("password")}
          />
          {errors?.password && (
            <ErrorMessage message={errors?.password.message as string} />
          )}
        </div> */}
        <div className="mb-3">
          <p>
            Not registered yet? <Link to={"/auth/register"}>Register here</Link>
          </p>
        </div>
        <Button type="submit" variant="primary" className="w-100">
          {authLoading ? "Logging in..." : "Submit"}
        </Button>
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

export default LoginView;
