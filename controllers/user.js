const asyncHandler = require("../middleware/async");
const User = require("../models/user");
// const Batch = require("../models/batch");
// const Course = require("../models/course");
const path = require("path");
const fs = require("fs");


// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private

exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await Users.find({});
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/v1/user/:id
// @access  Private

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res
      .status(404)
      .json({ message: "User not found with id of ${req.params.id}" });
  } else {
    res.status(200).json({
      success: true,
      data: user,
    });
  }
});

// @desc    Create new student
// @route   POST /api/v1/students
// @access  Public



exports.signup = asyncHandler(async (req, res, next) => {
  const existingUser = await User.findOne({ email: req.body.email });

  if (existingUser) {
    return res.status(400).send({ message: "User already exists" });
  }

  // Create a new user
  const newUser = await User.create(req.body);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: newUser,
  });
});

// @desc   Login student
// @route  POST /api/v1/students/login
// @access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide a email and password" });
  }

  // Check if student exists
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  sendTokenResponse(user, 200, res);
});


//GET CURRENT USER
exports.getMe = asyncHandler(async (req, res, next) => {
  // Show current user and don't show the password
  const user = await User.findById(req.user.id).select("-password");

  res.status(200).json(user);
});



// exports.deleteStudent = asyncHandler(async (req, res, next) => {
//   console.log(req.params.id);
//   Student.findByIdAndDelete(req.params.id)
//     .then((student) => {
//       if (student != null) {
//         var imagePath = path.join(
//           __dirname,
//           "..",
//           "public",
//           "uploads",
//           student.image
//         );

//         fs.unlink(imagePath, (err) => {
//           if (err) {
//             console.log(err);
//           }
//           res.status(200).json({
//             success: true,
//             message: "Student deleted successfully",
//           });
//         });
//       } else {
//         res.status(400).json({
//           success: false,
//           message: "Student not found",
//         });
//       }
//     })
//     .catch((err) => {
//       res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     });
// });

// @desc Upload Single Image
// @route POST /api/v1/auth/upload
// @access Private

exports.uploadImage = asyncHandler(async (req, res, next) => {
  // // check for the file size and send an error message
  // if (req.file.size > process.env.MAX_FILE_UPLOAD) {
  //   return res.status(400).send({
  //     message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
  //   });
  // }

  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }
  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});

// Get token from model , create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    //Cookie will expire in 30 days
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Cookie security is false .if you want https then use this code. do not use in development time
  if (process.env.NODE_ENV === "proc") {
    options.secure = true;
  }
  //we have created a cookie with a token

  res
    .status(statusCode)
    .cookie("token", token, options) // key , value ,options
    .json({
      success: true,
      token,
    });
};
