import { ToastContainer, toast } from 'react-toastify';

export const customToastError = (message) => {
  toast.error(message, {
    position:"top-right",
    autoClose: 5000,
    hideProgressBar:false,
    newestOnTop:true,
    closeOnClick:true,
    rtl:false,
    pauseOnFocusLoss:false,
    draggable:false,
    pauseOnHover: false,  
  });
};

export const customToastSuccess = (message) => {
  toast.success(message, {
    position:"top-right",
    autoClose: 5000,
    hideProgressBar:false,
    newestOnTop:true,
    closeOnClick:true,
    rtl:false,
    pauseOnFocusLoss:false,
    draggable:false,
    pauseOnHover: false,  
  });
};
