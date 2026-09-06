import { toast } from "react-toastify";

export const handleSuccess = (msg) => {
  toast.success(msg, {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  });
};

export const handleError = (msg) => {
  toast.error(msg, {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  });
};
