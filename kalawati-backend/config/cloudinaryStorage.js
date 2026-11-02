const createCloudinaryStorage = (cloudinary, options = {}) => {
  return {
    _handleFile(req, file, callback) {
      let completed = false;

      const done = (error, result) => {
        if (completed) return;
        completed = true;
        callback(error, result);
      };

      const uploadOptions = {
        folder: options.folder,
        resource_type: options.resourceType || "image",
        allowed_formats: options.allowedFormats,
        transformation: options.transformation,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            return done(error);
          }

          if (!result || !result.secure_url || !result.public_id) {
            return done(
              new Error("Cloudinary upload returned an invalid result"),
            );
          }

          done(null, {
            path: result.secure_url,
            filename: result.public_id,
            public_id: result.public_id,
            resource_type: result.resource_type,
            size: result.bytes,
          });
        },
      );

      file.stream.on("error", (error) => {
        uploadStream.destroy();
        done(error);
      });

      uploadStream.on("error", (error) => {
        done(error);
      });

      file.stream.pipe(uploadStream);
    },

    _removeFile(req, file, callback) {
      if (!file.filename) {
        return callback(null);
      }

      cloudinary.uploader
        .destroy(file.filename, {
          resource_type: file.resource_type || options.resourceType || "image",
        })
        .then(() => callback(null))
        .catch(callback);
    },
  };
};

module.exports = createCloudinaryStorage;
