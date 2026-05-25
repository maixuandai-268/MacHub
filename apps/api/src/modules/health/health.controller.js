export function getHealth(_req, res) {
  res.json({
    success: true,
    message: "OK",
    data: {
      service: "api",
    },
  });
}
