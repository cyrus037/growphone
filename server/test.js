const mongoose = require("mongoose");

mongoose.connect("mongodb://nishilsoni01_db_user:U4YJaSqDdEpKYDwL@ac-udov78n-shard-00-00.djdwyot.mongodb.net:27017,ac-udov78n-shard-00-01.djdwyot.mongodb.net:27017,ac-udov78n-shard-00-02.djdwyot.mongodb.net:27017/?ssl=true&replicaSet=atlas-dkr8nf-shard-0&authSource=admin&appName=Cluster0")
.then(() => console.log("✅ Connected"))
.catch(err => console.log("❌", err.message));