export const errorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";
    error.message = error.message || "Internal Server Error"
  
    process.env.NODE_ENV === "dev" ? devMode(error,res) : produtionMode(error,res) ; 

  };

  const produtionMode = (error , res)=>{
    return res.status(error.statusCode).json({
      message: error.message,
      status: error.status,
    });
  }

  const devMode = (error , res)=>{
    return res.status(error.statusCode ).json({
      message: error.message,
      status: error.status,
      error: error,
      stack: process.env.NODE_ENV === "dev" ? error.stack : "Error stack",
    });
  }



