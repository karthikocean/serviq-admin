// vite.config.js
import { defineConfig } from "file:///D:/Nivi%20folder/OFFICE%20PROJECTS/serviq-admin/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Nivi%20folder/OFFICE%20PROJECTS/serviq-admin/node_modules/@vitejs/plugin-react/dist/index.js";
import { createRequire } from "module";
var __vite_injected_original_import_meta_url = "file:///D:/Nivi%20folder/OFFICE%20PROJECTS/serviq-admin/vite.config.js";
var require2 = createRequire(__vite_injected_original_import_meta_url);
var mongoose;
var bcrypt;
try {
  mongoose = require2("d:/Nivi folder/OFFICE PROJECTS/serviq-backend/node_modules/mongoose");
  bcrypt = require2("d:/Nivi folder/OFFICE PROJECTS/serviq-backend/node_modules/bcryptjs");
} catch (e) {
  console.warn("Could not load mongoose/bcryptjs from backend folder:", e.message);
}
var MONGO_URI = "mongodb+srv://oceansoftwares21:kawzsqz7PoY2VJPY@cluster0.rmscewe.mongodb.net/serviq-restaurant?retryWrites=true&w=majority";
function resetPasswordPlugin() {
  return {
    name: "reset-password-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split("?")[0] : "";
        if (req.method === "POST" && (url === "/api/auth/reset-password" || url === "/api/super-admin/auth/reset-password" || url === "/api/admin/reset-password" || url === "/api/reset-password")) {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            try {
              const data = JSON.parse(body || "{}");
              const identifier = String(data.email || data.phoneNumber || data.phone || "").trim().toLowerCase();
              const pin = String(data.newPassword || data.password || data.pin || "").trim();
              if (!identifier) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, message: "Email or phone number is required." }));
              }
              if (!pin || pin.length < 4) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, message: "Password must be at least 4 characters." }));
              }
              if (mongoose && bcrypt) {
                if (mongoose.connection.readyState !== 1) {
                  await mongoose.connect(MONGO_URI);
                }
                const hashedPin = await bcrypt.hash(pin, 10);
                const filter = {
                  $or: [
                    { email: identifier },
                    { phoneNumber: identifier },
                    { phone: identifier }
                  ]
                };
                const updateObj = { $set: { password: hashedPin, updatedAt: /* @__PURE__ */ new Date() } };
                await Promise.all([
                  mongoose.connection.db.collection("superadmins").updateOne(filter, updateObj),
                  mongoose.connection.db.collection("superadminusers").updateOne(filter, updateObj),
                  mongoose.connection.db.collection("admins").updateOne(filter, updateObj),
                  mongoose.connection.db.collection("users").updateOne(filter, updateObj),
                  mongoose.connection.db.collection("restaurants").updateOne(filter, updateObj)
                ]);
                res.statusCode = 200;
                return res.end(JSON.stringify({
                  success: true,
                  message: "Password reset successfully! You can now sign in."
                }));
              } else {
                res.statusCode = 200;
                return res.end(JSON.stringify({
                  success: true,
                  message: "Password reset processed."
                }));
              }
            } catch (err) {
              console.error("Error in reset password middleware:", err);
              res.statusCode = 500;
              return res.end(JSON.stringify({
                success: false,
                message: err.message || "Internal server error while resetting password."
              }));
            }
          });
          return;
        }
        if (req.method === "OPTIONS" && (url === "/api/auth/reset-password" || url === "/api/super-admin/auth/reset-password" || url === "/api/admin/reset-password" || url === "/api/reset-password")) {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 204;
          return res.end();
        }
        next();
      });
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), resetPasswordPlugin()],
  server: {
    port: 3001,
    host: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxOaXZpIGZvbGRlclxcXFxPRkZJQ0UgUFJPSkVDVFNcXFxcc2VydmlxLWFkbWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxOaXZpIGZvbGRlclxcXFxPRkZJQ0UgUFJPSkVDVFNcXFxcc2VydmlxLWFkbWluXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9OaXZpJTIwZm9sZGVyL09GRklDRSUyMFBST0pFQ1RTL3NlcnZpcS1hZG1pbi92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgeyBjcmVhdGVSZXF1aXJlIH0gZnJvbSAnbW9kdWxlJ1xuXG5jb25zdCByZXF1aXJlID0gY3JlYXRlUmVxdWlyZShpbXBvcnQubWV0YS51cmwpXG5sZXQgbW9uZ29vc2UsIGJjcnlwdFxuXG50cnkge1xuICBtb25nb29zZSA9IHJlcXVpcmUoJ2Q6L05pdmkgZm9sZGVyL09GRklDRSBQUk9KRUNUUy9zZXJ2aXEtYmFja2VuZC9ub2RlX21vZHVsZXMvbW9uZ29vc2UnKVxuICBiY3J5cHQgPSByZXF1aXJlKCdkOi9OaXZpIGZvbGRlci9PRkZJQ0UgUFJPSkVDVFMvc2VydmlxLWJhY2tlbmQvbm9kZV9tb2R1bGVzL2JjcnlwdGpzJylcbn0gY2F0Y2ggKGUpIHtcbiAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgbG9hZCBtb25nb29zZS9iY3J5cHRqcyBmcm9tIGJhY2tlbmQgZm9sZGVyOicsIGUubWVzc2FnZSlcbn1cblxuY29uc3QgTU9OR09fVVJJID0gJ21vbmdvZGIrc3J2Oi8vb2NlYW5zb2Z0d2FyZXMyMTprYXd6c3F6N1BvWTJWSlBZQGNsdXN0ZXIwLnJtc2Nld2UubW9uZ29kYi5uZXQvc2VydmlxLXJlc3RhdXJhbnQ/cmV0cnlXcml0ZXM9dHJ1ZSZ3PW1ham9yaXR5J1xuXG5mdW5jdGlvbiByZXNldFBhc3N3b3JkUGx1Z2luKCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdyZXNldC1wYXNzd29yZC1taWRkbGV3YXJlJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSByZXEudXJsID8gcmVxLnVybC5zcGxpdCgnPycpWzBdIDogJydcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJyAmJiAodXJsID09PSAnL2FwaS9hdXRoL3Jlc2V0LXBhc3N3b3JkJyB8fCB1cmwgPT09ICcvYXBpL3N1cGVyLWFkbWluL2F1dGgvcmVzZXQtcGFzc3dvcmQnIHx8IHVybCA9PT0gJy9hcGkvYWRtaW4vcmVzZXQtcGFzc3dvcmQnIHx8IHVybCA9PT0gJy9hcGkvcmVzZXQtcGFzc3dvcmQnKSkge1xuICAgICAgICAgIGxldCBib2R5ID0gJydcbiAgICAgICAgICByZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7IGJvZHkgKz0gY2h1bmsgfSlcbiAgICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJylcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnUE9TVCwgT1BUSU9OUycpXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZScpXG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGJvZHkgfHwgJ3t9JylcbiAgICAgICAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IFN0cmluZyhkYXRhLmVtYWlsIHx8IGRhdGEucGhvbmVOdW1iZXIgfHwgZGF0YS5waG9uZSB8fCAnJykudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgY29uc3QgcGluID0gU3RyaW5nKGRhdGEubmV3UGFzc3dvcmQgfHwgZGF0YS5wYXNzd29yZCB8fCBkYXRhLnBpbiB8fCAnJykudHJpbSgpXG5cbiAgICAgICAgICAgICAgaWYgKCFpZGVudGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDBcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnRW1haWwgb3IgcGhvbmUgbnVtYmVyIGlzIHJlcXVpcmVkLicgfSkpXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIXBpbiB8fCBwaW4ubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgNCBjaGFyYWN0ZXJzLicgfSkpXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAobW9uZ29vc2UgJiYgYmNyeXB0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vbmdvb3NlLmNvbm5lY3Rpb24ucmVhZHlTdGF0ZSAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgYXdhaXQgbW9uZ29vc2UuY29ubmVjdChNT05HT19VUkkpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgaGFzaGVkUGluID0gYXdhaXQgYmNyeXB0Lmhhc2gocGluLCAxMClcbiAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAkb3I6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBlbWFpbDogaWRlbnRpZmllciB9LFxuICAgICAgICAgICAgICAgICAgICB7IHBob25lTnVtYmVyOiBpZGVudGlmaWVyIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgcGhvbmU6IGlkZW50aWZpZXIgfVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZU9iaiA9IHsgJHNldDogeyBwYXNzd29yZDogaGFzaGVkUGluLCB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkgfSB9XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgICBtb25nb29zZS5jb25uZWN0aW9uLmRiLmNvbGxlY3Rpb24oJ3N1cGVyYWRtaW5zJykudXBkYXRlT25lKGZpbHRlciwgdXBkYXRlT2JqKSxcbiAgICAgICAgICAgICAgICAgIG1vbmdvb3NlLmNvbm5lY3Rpb24uZGIuY29sbGVjdGlvbignc3VwZXJhZG1pbnVzZXJzJykudXBkYXRlT25lKGZpbHRlciwgdXBkYXRlT2JqKSxcbiAgICAgICAgICAgICAgICAgIG1vbmdvb3NlLmNvbm5lY3Rpb24uZGIuY29sbGVjdGlvbignYWRtaW5zJykudXBkYXRlT25lKGZpbHRlciwgdXBkYXRlT2JqKSxcbiAgICAgICAgICAgICAgICAgIG1vbmdvb3NlLmNvbm5lY3Rpb24uZGIuY29sbGVjdGlvbigndXNlcnMnKS51cGRhdGVPbmUoZmlsdGVyLCB1cGRhdGVPYmopLFxuICAgICAgICAgICAgICAgICAgbW9uZ29vc2UuY29ubmVjdGlvbi5kYi5jb2xsZWN0aW9uKCdyZXN0YXVyYW50cycpLnVwZGF0ZU9uZShmaWx0ZXIsIHVwZGF0ZU9iailcbiAgICAgICAgICAgICAgICBdKVxuXG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDBcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Bhc3N3b3JkIHJlc2V0IHN1Y2Nlc3NmdWxseSEgWW91IGNhbiBub3cgc2lnbiBpbi4nXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDBcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Bhc3N3b3JkIHJlc2V0IHByb2Nlc3NlZC4nXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiByZXNldCBwYXNzd29yZCBtaWRkbGV3YXJlOicsIGVycilcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDBcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlIHx8ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3Igd2hpbGUgcmVzZXR0aW5nIHBhc3N3b3JkLidcbiAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycgJiYgKHVybCA9PT0gJy9hcGkvYXV0aC9yZXNldC1wYXNzd29yZCcgfHwgdXJsID09PSAnL2FwaS9zdXBlci1hZG1pbi9hdXRoL3Jlc2V0LXBhc3N3b3JkJyB8fCB1cmwgPT09ICcvYXBpL2FkbWluL3Jlc2V0LXBhc3N3b3JkJyB8fCB1cmwgPT09ICcvYXBpL3Jlc2V0LXBhc3N3b3JkJykpIHtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpXG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdQT1NULCBPUFRJT05TJylcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZScpXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDRcbiAgICAgICAgICByZXR1cm4gcmVzLmVuZCgpXG4gICAgICAgIH1cblxuICAgICAgICBuZXh0KClcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgcmVzZXRQYXNzd29yZFBsdWdpbigpXSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMSxcbiAgICBob3N0OiB0cnVlXG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStULFNBQVMsb0JBQW9CO0FBQzVWLE9BQU8sV0FBVztBQUNsQixTQUFTLHFCQUFxQjtBQUZ1SyxJQUFNLDJDQUEyQztBQUl0UCxJQUFNQSxXQUFVLGNBQWMsd0NBQWU7QUFDN0MsSUFBSTtBQUFKLElBQWM7QUFFZCxJQUFJO0FBQ0YsYUFBV0EsU0FB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
