import User from "../models/user.model.js";
import cloudinary from "../lib/cloudnary.js";
import Message from "../models/message.model.js";
import { getRecieverSocketId , io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    console.log("filteredUsers: ", filteredUsers);

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const sendMessage = async (req, res) => {
    try {
        const { text , image} = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // Send the message to the receiver using socket.io real-time communication
        const receiverSocketId = getRecieverSocketId(receiverId);
        if(receiverSocketId){
          io.to(receiverSocketId).emmit("newMessage", newMessage)
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
        
    }
}