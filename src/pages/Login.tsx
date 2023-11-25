import { Link, useNavigate } from "react-router-dom";
import { AuthAPI } from "../utils/api-helper";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeftCircleFill } from "react-bootstrap-icons";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "../components/ErrorMessge";
import { AxiosError, AxiosResponse } from "axios";
import { IncomingErrorResponseDataType } from "../types";
import { Alert, Button } from "react-bootstrap";

const LoginView = () => {
  const { authDispatcher, authLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const navigate = useNavigate();

  const submitData: SubmitHandler<FieldValues> = async (data) => {
    const [res, err] = (await authDispatcher(AuthAPI.login, data)) as [
      AxiosResponse,
      AxiosError
    ];

    if (err && err instanceof AxiosError) {
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
    } else if (res && !res?.data.error) {
      navigate("/");
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
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address or Username
          </label>
          <input
            type="username"
            className={`form-control ${errors?.username && "is-invalid"}`}
            id="username"
            aria-describedby="emailHelp"
            // {...register("username", { required: "Enter the ID here" })}
            {...register("username")}
          />
          {errors?.username && (
            <ErrorMessage message={errors?.username.message as string} />
          )}
        </div>
        <div className="mb-3">
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
        </div>
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
