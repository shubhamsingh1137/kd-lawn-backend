const Package = require("../../../models/Package");

async function getPackages() {
  const packages = await Package.find({});

  return packages;
}

async function getPackageByName(name) {
  const packageData = await Package.findOne({
    name: new RegExp(`^${name}$`, "i")
  });

  return packageData;
}

module.exports = {
  getPackages,
  getPackageByName
};