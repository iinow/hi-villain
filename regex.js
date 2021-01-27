const str = "https://hahaha.dooray.com/profile-image/12312387128;"

const urlPattern = /^https:\/\/(.+)\.dooray\.com\/profile-image\/(\d+);/i

console.log(urlPattern.exec(str))
