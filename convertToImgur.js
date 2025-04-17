const IMGUR_CLIENT_ID; //Put cleint ID from discord

    const progressText = document.getElementById("upload-progress-text");
    const progressBar = document.getElementById("upload-progress-fill");

    async function uploadToImgur(file, retries = 2) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          return result.data.link;
        } else {
          throw new Error(result.data.error || "Imgur upload failed");
        }

      } catch (err) {
        if (retries > 0) {
          console.warn(`Retrying upload... (${retries} left)`);
          await new Promise(res => setTimeout(res, 1000));
          return uploadToImgur(file, retries - 1);
        } else {
          throw err;
        }
      }
    }
