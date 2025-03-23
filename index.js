import connectDB from "./api/db/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Example app listening on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => console.log(err));

app.on("error", (err) => {
  console.error("❌ Server Error:", err);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("Unhandled Rejection, shutting down ..............😢😢😢😢");
  console.log(err.name, err.message);
  process.exit(1);
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});
