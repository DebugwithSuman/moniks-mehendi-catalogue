
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const supabaseUrl = "https://fcpdgxxrbrmuzepmxsps.supabase.co";
const supabaseKey = "sb_publishable_tiZWv6wYSgB8GmBumnzLMA_mAlVY0Os";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  try {
    const email = await ask("Admin email: ");
    const password = await ask("Admin password: ");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      console.error("Login failed:", loginError.message);
      return;
    }

    console.log("Signed-in UID:", data.user.id);

    const root = path.join(__dirname, "images");
    const bucket = "Mehendi designs";

    function getImages(folder) {
      return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(folder, entry.name);

        if (entry.isDirectory()) return getImages(fullPath);

        if (/\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
          return [fullPath];
        }

        return [];
      });
    }

    const files = getImages(root);
    console.log(`Found ${files.length} images.`);

    for (const filePath of files) {
      const relativePath = path.relative(root, filePath).replace(/\\/g, "/");
      const fileBuffer = fs.readFileSync(filePath);
      const extension = path.extname(filePath).toLowerCase();

      const contentType =
        extension === ".png"
          ? "image/png"
          : extension === ".webp"
          ? "image/webp"
          : "image/jpeg";

      const { error } = await supabase.storage
        .from(bucket)
        .upload(relativePath, fileBuffer, {
          contentType,
          upsert: false,
        });

      if (error) {
        console.error("Failed:", relativePath, error.message);
      } else {
        console.log("Uploaded:", relativePath);
      }
    }

    await supabase.auth.signOut();
  } finally {
    rl.close();
  }
}

main().catch((error) => console.error("Error:", error.message));