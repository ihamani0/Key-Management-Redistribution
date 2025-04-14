export const userDetails = (req, res) => {
  res.status(200).json({
    message: "You are authorized to access this route.",
    user: req.user,
  });
};
