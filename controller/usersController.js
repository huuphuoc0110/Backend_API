//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const {Users, Gateways} = require("../model/model");

const usersController = {
    //Add user
    addUsers: async(req, res)=>{
        try{
            const newUsers = new Users(req.body);
            const saveUsers = await newUsers.save();
            res.status(200).json(saveUsers);
        }catch(err){    
            res.status(500).json(err); //HTTP request code
        };
        // res.status(200).json(req.body);
    },
    getAllUsers: async(req, res)=>{
        try{
            const users = await Users.find().populate("gateways");
            res.status(200).json(users);
        }catch(err){    
            res.status(500).json(err); //HTTP request code
        };
    },
    updateUsers: async(req, res)=>{
        try{
            const users = await Users.findByIdAndUpdate(req.params.id, {$set: req.body }, { new: true });
            // await users.updateOne({$set: req.body}, { new: true });
            res.status(200).json(users);
        }catch(err){    
            res.status(500).json(err); //HTTP request code
        };
    },
};

module.exports = usersController;