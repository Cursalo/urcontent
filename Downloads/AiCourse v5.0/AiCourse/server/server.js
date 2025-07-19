// IMPORT
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import gis from 'g-i-s';
import youtubesearchapi from 'youtube-search-api';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { createApi } from 'unsplash-js';
import showdown from 'showdown';
import axios from 'axios';
import Stripe from 'stripe';
import Flutterwave from 'flutterwave-node-v3';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Load environment variables
dotenv.config();

// Initialize services that need config
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
const mercadopagoClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

//INITIALIZE
const app = express();
app.use(cors());
const PORT = process.env.PORT;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const unsplash = createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY });

// SPANISH TRANSLATIONS
const translations = {
  email: {
    passwordReset: {
      subject: 'Restablecimiento de Contraseña',
      preview: 'Restablecimiento de Contraseña',
      header: 'Restablecimiento de Contraseña',
      body: 'Haz clic en el botón de abajo para restablecer la contraseña de tu cuenta',
      button: 'Restablecer',
      closing: 'Saludos,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">El equipo de <strong>{{company}}</strong></p>'
    },
    certificate: {
      subject: 'Certificado de finalización'
    },
    receipt: {
      subject: 'Recibo de Suscripción'
    },
    subscriptionRenewal: {
      subject: '{{name}} Tu Plan de Suscripción Ha Sido Renovado',
      preview: 'Suscripción Renovada',
      header: 'Suscripción Renovada',
      body: '{{name}}, tu plan de suscripción ha sido renovado.',
      closing: 'Saludos,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">El equipo de <strong>{{company}}</strong></p>'
    },
    subscriptionCancellation: {
      subject: '{{name}} Tu Plan de Suscripción Ha Sido {{status}}',
      preview: 'Suscripción {{status}}',
      header: 'Suscripción {{status}}',
      body: '{{name}}, tu plan de suscripción ha sido {{status}}. Reactiva tu plan haciendo clic en el botón de abajo.',
      button: 'Reactivar',
      closing: 'Saludos,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">El equipo de <strong>{{company}}</strong></p>'
    }
  },
  messages: {
    userExists: 'Ya existe un usuario con este correo electrónico',
    accountCreated: 'Cuenta creada exitosamente',
    invalidCredentials: 'Correo electrónico o contraseña inválidos',
    signinSuccessful: 'Inicio de sesión exitoso',
    userNotFound: 'Usuario no encontrado',
    passwordResetSent: 'Enlace de restablecimiento de contraseña enviado a tu correo electrónico',
    invalidToken: 'Token inválido o expirado',
    passwordUpdated: 'Contraseña actualizada exitosamente',
    internalServerError: 'Error interno del servidor',
    emailSentSuccessfully: 'Correo enviado exitosamente',
    failedToSendEmail: 'Error al enviar correo',
    receiptSent: 'Recibo enviado a tu correo'
  }
};

// Helper function to replace template variables
const replaceTemplateVars = (template, vars) => {
  let result = template;
  Object.keys(vars).forEach(key => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), vars[key]);
  });
  return result;
};

//SCHEMA
const adminSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    mName: String,
    type: { type: String, required: true },
    total: { type: Number, default: 0 },
    terms: { type: String, default: '' },
    privacy: { type: String, default: '' },
    cancel: { type: String, default: '' },
    refund: { type: String, default: '' },
    billing: { type: String, default: '' }
});
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    mName: String,
    password: String,
    type: String,
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    // Gamificación
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now },
    totalCoursesCompleted: { type: Number, default: 0 },
    totalLessonsCompleted: { type: Number, default: 0 },
    achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' }
});
const courseSchema = new mongoose.Schema({
    user: String,
    content: { type: String, required: true },
    type: String,
    mainTopic: String,
    photo: String,
    date: { type: Date, default: Date.now },
    end: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false }
});
// Nuevo esquema para cursos JSON estructurados
const jsonCourseSchema = new mongoose.Schema({
    user: String,
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID del creador
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: String,
    level: String,
    duration: String,
    language: { type: String, default: 'es' },
    instructor: String,
    thumbnail: String,
    
    // Sistema de monetización y visibilidad
    visibility: { 
        type: String, 
        enum: ['public', 'private', 'unlisted'], 
        default: 'public' 
    }, // public = gratis para todos, private = solo pagos, unlisted = link directo
    pricing: {
        isFree: { type: Boolean, default: true },
        price: { type: Number, default: 0 }, // Precio en la moneda local
        currency: { type: String, default: 'USD' },
        discountPrice: { type: Number },
        discountExpiry: { type: Date }
    },
    
    // Estadísticas del curso
    stats: {
        enrollments: { type: Number, default: 0 },
        completions: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 }
    },
    
    modules: [{
        id: Number,
        title: String,
        description: String,
        lessons: [{
            id: Number,
            title: String,
            content: String,
            type: String,
            duration: String,
            resources: [mongoose.Schema.Types.Mixed],
            codeExamples: [{
                title: String,
                code: String
            }]
        }],
        quiz: {
            title: String,
            description: String,
            questions: [mongoose.Schema.Types.Mixed]
        }
    }],
    finalQuiz: {
        title: String,
        description: String,
        passingScore: Number,
        questions: [mongoose.Schema.Types.Mixed]
    },
    requirements: [String],
    objectives: [String],
    tags: [String],
    type: { type: String, default: 'json_course' },
    mainTopic: String,
    date: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    completed: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false } // Destacado en la plataforma
});
const subscriptionSchema = new mongoose.Schema({
    user: String,
    subscription: String,
    subscriberId: String,
    plan: String,
    method: String,
    date: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});
const contactShema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    phone: Number,
    msg: String,
    date: { type: Date, default: Date.now },
});
const notesSchema = new mongoose.Schema({
    course: String,
    notes: String,
});
const examSchema = new mongoose.Schema({
    course: String,
    exam: String,
    marks: String,
    passed: { type: Boolean, default: false },
});
const langSchema = new mongoose.Schema({
    course: String,
    lang: String,
});
const blogSchema = new mongoose.Schema({
    title: { type: String, unique: true, required: true },
    excerpt: String,
    category: String,
    tags: String,
    content: String,
    image: {
        type: Buffer,
        required: true
    },
    popular: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
});

// Schema para inscripciones de estudiantes en cursos
const enrollmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'JsonCourse', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    progress: {
        completedLessons: [{ 
            moduleId: Number,
            lessonId: Number,
            completedAt: { type: Date, default: Date.now }
        }],
        completedQuizzes: [{
            moduleId: Number,
            quizId: String,
            completedAt: { type: Date, default: Date.now },
            score: Number,
            passed: Boolean,
            answers: [mongoose.Schema.Types.Mixed]
        }],
        currentModule: { type: Number, default: 1 },
        currentLesson: { type: Number, default: 1 }
    },
    completed: { type: Boolean, default: false },
    completionDate: { type: Date },
    certificateId: { type: String },
    finalQuizScore: { type: Number },
    finalQuizPassed: { type: Boolean, default: false }
});

// Schema para logros/achievements
const achievementSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true }, // Identificador único
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // Emoji o nombre de icono
    xpReward: { type: Number, default: 0 },
    category: { type: String, enum: ['course', 'streak', 'quiz', 'social', 'special'], default: 'course' },
    criteria: {
        type: { type: String, enum: ['courses_completed', 'lessons_completed', 'streak_days', 'quiz_score', 'login_time', 'custom'] },
        value: Number, // Valor requerido para desbloquear
        coursesRequired: [String], // IDs de cursos específicos si aplica
        timeCondition: String // Para logros basados en tiempo
    },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
    active: { type: Boolean, default: true }
});

// Schema para actividad diaria del usuario
const userActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    actions: [{
        type: { type: String, enum: ['lesson_completed', 'quiz_completed', 'course_completed', 'login', 'achievement_unlocked'] },
        details: mongoose.Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now },
        xpEarned: { type: Number, default: 0 }
    }],
    totalXpEarned: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    quizzesCompleted: { type: Number, default: 0 }
});

// Schema para disparador de ideas
const ideaPromptSchema = new mongoose.Schema({
    category: { type: String, required: true }, // ej: "IA para Profesionales", "Desarrollo Web", etc.
    prompts: [{ type: String, required: true }], // Lista de ideas/prompts
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Schema para conversaciones del chat de ideas
const ideaChatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true }, // ID único de la sesión de chat
    messages: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        ideaGenerated: { type: String }, // Si el mensaje generó una idea específica
        courseRecommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JsonCourse' }]
    }],
    currentTopic: { type: String }, // Tema actual de la conversación
    generatedIdeas: [{ type: String }], // Ideas generadas en esta sesión
    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now }
});

// Schema para reviews/puntuaciones de cursos
const courseReviewSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'JsonCourse', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, maxlength: 1000 },
    helpful: { type: Number, default: 0 }, // Votos de "útil"
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Usuarios que votaron útil
    verified: { type: Boolean, default: false }, // Si completó el curso
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Schema para seguimiento de creadores
const followSchema = new mongoose.Schema({
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Quien sigue
    followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // A quien sigue
    createdAt: { type: Date, default: Date.now }
});

// Schema para notificaciones de la comunidad
const communityNotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['new_follower', 'course_reviewed', 'course_published', 'idea_shared', 'course_purchased'],
        required: true 
    },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'JsonCourse' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

//MODEL
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const JsonCourse = mongoose.model('JsonCourse', jsonCourseSchema);  // Nuevo modelo para cursos JSON
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const Contact = mongoose.model('Contact', contactShema);
const Admin = mongoose.model('Admin', adminSchema);
const NotesSchema = mongoose.model('Notes', notesSchema);
const ExamSchema = mongoose.model('Exams', examSchema);
const LangSchema = mongoose.model('Lang', langSchema);
const BlogSchema = mongoose.model('Blog', blogSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const UserActivity = mongoose.model('UserActivity', userActivitySchema);
const IdeaPrompt = mongoose.model('IdeaPrompt', ideaPromptSchema);
const IdeaChat = mongoose.model('IdeaChat', ideaChatSchema);
const CourseReview = mongoose.model('CourseReview', courseReviewSchema);
const Follow = mongoose.model('Follow', followSchema);
const CommunityNotification = mongoose.model('CommunityNotification', communityNotificationSchema);

//REQUEST

//SIGNUP
app.post('/api/signup', async (req, res) => {
    const { email, mName, password, type } = req.body;

    try {
        const estimate = await User.estimatedDocumentCount();
        if (estimate > 0) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.json({ success: false, message: 'User with this email already exists' });
            }
            const newUser = new User({ email, mName, password, type });
            await newUser.save();
            res.json({ success: true, message: 'Account created successfully', userId: newUser._id });
        } else {
            const newUser = new User({ email, mName, password, type: 'forever' });
            await newUser.save();
            const newAdmin = new Admin({ email, mName, type: 'main' });
            await newAdmin.save();
            res.json({ success: true, message: 'Account created successfully', userId: newUser._id });
        }
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//SIGNIN
app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        if (password === user.password) {
            return res.json({ success: true, message: 'SignIn Successful', userData: user });
        }

        res.json({ success: false, message: 'Invalid email or password' });

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Invalid email or password' });
    }

});

//SIGNINSOCIAL
app.post('/api/social', async (req, res) => {
    const { email, name } = req.body;
    let mName = name;
    let password = '';
    let type = 'free';
    try {
        const user = await User.findOne({ email });

        if (!user) {
            const estimate = await User.estimatedDocumentCount();
            if (estimate > 0) {
                const newUser = new User({ email, mName, password, type });
                await newUser.save();
                res.json({ success: true, message: 'Account created successfully', userData: newUser });
            } else {
                const newUser = new User({ email, mName, password, type });
                await newUser.save();
                const newAdmin = new Admin({ email, mName, type: 'main' });
                await newAdmin.save();
                res.json({ success: true, message: 'Account created successfully', userData: newUser });
            }
        } else {
            return res.json({ success: true, message: 'SignIn Successful', userData: user });
        }

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

});

//SEND MAIL
app.post('/api/data', async (req, res) => {
    const receivedData = req.body;

    try {
        const emailHtml = receivedData.html;

        const options = {
            from: process.env.EMAIL,
            to: receivedData.to,
            subject: receivedData.subject,
            html: emailHtml,
        };

        const data = await transporter.sendMail(options);
        res.status(200).json(data);
    } catch (error) {
        console.log('Error', error);
        res.status(400).json(error);
    }
});

//FOROGT PASSWORD
app.post('/api/forgot', async (req, res) => {
    const { email, name, company, logo } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetLink = `${process.env.WEBSITE_URL}/reset-password/${token}`;

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: `${name} Password Reset`,
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
            <html lang="en">
            
              <head></head>
             <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Password Reset<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
             </div>
            
                <body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                  <tr style="width:100%">
                    <td>
                      <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                        <tbody>
                          <tr>
                            <td><img alt="Vercel" src="${logo}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                          </tr>
                        </tbody>
                      </table>
                      <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Password Reset</h1>
                      <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Click on the button below to reset the password for your account ${email}.</p>
                      <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                        <tbody>
                          <tr>
                            <td><a href="${resetLink}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="p-x:20px;p-y:12px;max-width:100%;display:inline-block;line-height:120%;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:9px"</span><span>Reset</span></a></td>
                          </tr>
                        </tbody>
                      </table>
                      <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${company}</strong> Team</p></p>
                      </td>
                  </tr>
                </table>
              </body>
            
            </html>`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//FOROGT PASSWORD
app.post('/api/reset-password', async (req, res) => {
    const { password, token } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.json({ success: true, message: 'Invalid or expired token' });
        }

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.json({ success: true, message: 'Password updated successfully', email: user.email });

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET DATA FROM MODEL
app.post('/api/prompt', async (req, res) => {
    const receivedData = req.body;

    const promptString = receivedData.prompt;

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

    const prompt = promptString;

    await model.generateContent(prompt).then(result => {
        const response = result.response;
        const generatedText = response.text();
        res.status(200).json({ generatedText });
    }).catch(error => {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    })
});

//GET GENERATE THEORY
app.post('/api/generate', async (req, res) => {
    const receivedData = req.body;

    const promptString = receivedData.prompt;

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

    const prompt = promptString

    await model.generateContent(prompt).then(result => {
        const response = result.response;
        const txt = response.text();
        const converter = new showdown.Converter();
        const markdownText = txt;
        const text = converter.makeHtml(markdownText);
        res.status(200).json({ text });
    }).catch(error => {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    })

});

//GET IMAGE
app.post('/api/image', async (req, res) => {
    const receivedData = req.body;
    const promptString = receivedData.prompt;
    gis(promptString, logResults);
    function logResults(error, results) {
        if (error) {
            //ERROR
            console.log('Error', error);
        }
        else {
            res.status(200).json({ url: results[0].url });
        }
    }
})

//GET VIDEO 
app.post('/api/yt', async (req, res) => {
    try {

        const receivedData = req.body;
        const promptString = receivedData.prompt;
        const video = await youtubesearchapi.GetListByKeyword(promptString, [false], [1], [{ type: 'video' }])
        const videoId = await video.items[0].id;
        res.status(200).json({ url: videoId });

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET TRANSCRIPT 
app.post('/api/transcript', async (req, res) => {
    const receivedData = req.body;
    const promptString = receivedData.prompt;
    YoutubeTranscript.fetchTranscript(promptString).then(video => {
        res.status(200).json({ url: video });
    }).catch(error => {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    })
});

//STORE COURSE
app.post('/api/course', async (req, res) => {
    const { user, content, type, mainTopic, lang } = req.body;

    unsplash.search.getPhotos({
        query: mainTopic,
        page: 1,
        perPage: 1,
        orientation: 'landscape',
    }).then(async (result) => {
        const photos = result.response.results;
        const photo = photos[0].urls.regular
        try {
            const newCourse = new Course({ user, content, type, mainTopic, photo });
            await newCourse.save();
            const newLang = new LangSchema({ course: newCourse._id, lang: lang });
            await newLang.save();
            res.json({ success: true, message: 'Course created successfully', courseId: newCourse._id });
        } catch (error) {
            console.log('Error', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }).catch(error => {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    })
});

//STORE COURSE SHARED
app.post('/api/courseshared', async (req, res) => {
    const { user, content, type, mainTopic } = req.body;

    unsplash.search.getPhotos({
        query: mainTopic,
        page: 1,
        perPage: 1,
        orientation: 'landscape',
    }).then(async (result) => {
        const photos = result.response.results;
        const photo = photos[0].urls.regular
        try {
            const newCourse = new Course({ user, content, type, mainTopic, photo });
            await newCourse.save();
            res.json({ success: true, message: 'Course created successfully', courseId: newCourse._id });
        } catch (error) {
            console.log('Error', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    })
});

//UPDATE COURSE
app.post('/api/update', async (req, res) => {
    const { content, courseId } = req.body;
    try {

        await Course.findOneAndUpdate(
            { _id: courseId },
            [{ $set: { content: content } }]
        ).then(result => {
            res.json({ success: true, message: 'Course updated successfully' });
        }).catch(error => {
            res.status(500).json({ success: false, message: 'Internal server error' });
        })

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//DELETE COURSE
app.post('/api/deletecourse', async (req, res) => {
    const { courseId } = req.body;
    try {
        await Course.findOneAndDelete({ _id: courseId });
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/api/finish', async (req, res) => {
    const { courseId } = req.body;
    try {

        await Course.findOneAndUpdate(
            { _id: courseId },
            { $set: { completed: true, end: Date.now() } }
        ).then(result => {
            res.json({ success: true, message: 'Course completed successfully' });
        }).catch(error => {
            console.log('Error', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        })

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//SEND CERTIFICATE
app.post('/api/sendcertificate', async (req, res) => {
    const { html, email } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Certification of completion',
        html: html
    };

    transporter.sendMail(options, (error, info) => {
        if (error) {
            res.status(500).json({ success: false, message: 'Failed to send email' });
        } else {
            res.json({ success: true, message: 'Email sent successfully' });
        }
    });
});

// Backend: Modify API to handle pagination
app.get('/api/courses', async (req, res) => {
    try {
        const { userId, page = 1, limit = 9 } = req.query;
        const skip = (page - 1) * limit;

        const courses = await Course.find({ user: userId })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        res.json(courses);
    } catch (error) {
        console.log('Error', error);
        res.status(500).send('Internal Server Error');
    }
});

//GET SHARED COURSE
app.get('/api/shareable', async (req, res) => {
    try {
        const { id } = req.query;
        await Course.find({ _id: id }).then((result) => {
            res.json(result);
        });
    } catch (error) {
        console.log('Error', error);
        res.status(500).send('Internal Server Error');
    }
});

//GET PROFILE DETAILS
app.post('/api/profile', async (req, res) => {
    const { email, mName, password, uid } = req.body;
    try {

        if (password === '') {
            await User.findOneAndUpdate(
                { _id: uid },
                { $set: { email: email, mName: mName } }
            ).then(result => {
                res.json({ success: true, message: 'Profile Updated' });
            }).catch(error => {

                res.status(500).json({ success: false, message: 'Internal server error' });
            })
        } else {
            await User.findOneAndUpdate(
                { _id: uid },
                { $set: { email: email, mName: mName, password: password } }
            ).then(result => {
                res.json({ success: true, message: 'Profile Updated' });
            }).catch(error => {

                res.status(500).json({ success: false, message: 'Internal server error' });
            })
        }

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

//PAYPAL PAYMENT
app.post('/api/paypal', async (req, res) => {
    const { planId, email, name, lastName, post, address, country, brand, admin } = req.body;
    try {
        const firstLine = address.split(',').slice(0, -1).join(',');
        const secondLine = address.split(',').pop();

        const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
        const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
        const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
        const setSubscriptionPayload = (subscriptionPlanID) => {
            let subscriptionPayload = {
                "plan_id": subscriptionPlanID,
                "subscriber": { "name": { "given_name": name, "surname": lastName }, "email_address": email, "shipping_address": { "name": { "full_name": name }, "address": { "address_line_1": firstLine, "address_line_2": secondLine, "admin_area_2": admin, "admin_area_1": country, "postal_code": post, "country_code": country } } },
                "application_context": {
                    "brand_name": process.env.COMPANY,
                    "locale": "en-US",
                    "shipping_preference": "SET_PROVIDED_ADDRESS",
                    "user_action": "SUBSCRIBE_NOW",
                    "payment_method": {
                        "payer_selected": "PAYPAL",
                        "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
                    },
                    "return_url": `${process.env.WEBSITE_URL}/payment-success/${planId}`,
                    "cancel_url": `${process.env.WEBSITE_URL}/payment-failed`
                }
            }
            return subscriptionPayload

        }

        let subscriptionPlanID = planId;
        const response = await fetch('https://api-m.paypal.com/v1/billing/subscriptions', {
            method: 'POST',
            body: JSON.stringify(setSubscriptionPayload(subscriptionPlanID)),
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
        });
        const session = await response.json();
        res.send(session)
    } catch (error) {
        console.log('Error', error);
    }
});

//GET SUBSCRIPTION DETAILS
app.post('/api/subscriptiondetail', async (req, res) => {

    try {
        const { uid, email } = req.body;

        const userDetails = await Subscription.findOne({ user: uid });
        if (userDetails.method === 'stripe') {
            const subscription = await stripe.subscriptions.retrieve(
                userDetails.subscriberId
            );

            res.json({ session: subscription, method: userDetails.method });
        } else if (userDetails.method === 'paypal') {
            const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
            const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
            const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
            const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${userDetails.subscription}`, {
                headers: {
                    'Authorization': 'Basic ' + auth,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const session = await response.json();
            res.json({ session: session, method: userDetails.method });
        }
        else if (userDetails.method === 'flutterwave') {
            const payload = { "email": email };
            const response = await flw.Subscription.get(payload);
            res.json({ session: response['data'][0], method: userDetails.method });
        }
        else if (userDetails.method === 'paystack') {
            const authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
            const response = await axios.get(`https://api.paystack.co/subscription/${userDetails.subscriberId}`, {
                headers: {
                    Authorization: authorization
                }
            });

            let subscriptionDetails = null;
            subscriptionDetails = {
                subscription_code: response.data.data.subscription_code,
                createdAt: response.data.data.createdAt,
                updatedAt: response.data.data.updatedAt,
                customer_code: userDetails.subscription,
                email_token: response.data.data.email_token,
            };

            res.json({ session: subscriptionDetails, method: userDetails.method });
        }
        else {
            const YOUR_KEY_ID = process.env.RAZORPAY_KEY_ID;
            const YOUR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
            const SUBSCRIPTION_ID = userDetails.subscription;

            const config = {
                headers: {
                    'Content-Type': 'application/json'
                },
                auth: {
                    username: YOUR_KEY_ID,
                    password: YOUR_KEY_SECRET
                }
            };

            axios.get(`https://api.razorpay.com/v1/subscriptions/${SUBSCRIPTION_ID}`, config)
                .then(response => {
                    res.json({ session: response.data, method: userDetails.method });
                })
                .catch(error => {
                    console.log(error);
                });

        }

    } catch (error) {
        console.log('Error', error);
    }

});

//GET PAYPAL DETAILS
app.post('/api/paypaldetails', async (req, res) => {

    const { subscriberId, uid, plan } = req.body;

    let cost = 0;
    if (plan === process.env.MONTH_TYPE) {
        cost = process.env.MONTH_COST
    } else {
        cost = process.env.YEAR_COST
    }
    cost = cost / 4;

    await Admin.findOneAndUpdate(
        { type: 'main' },
        { $inc: { total: cost } }
    );

    await User.findOneAndUpdate(
        { _id: uid },
        { $set: { type: plan } }
    ).then(async result => {
        const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
        const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
        const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
        const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${subscriberId}`, {
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        const session = await response.json();
        res.send(session);
    }).catch(error => {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    })

});

//DOWNLOAD RECEIPT
app.post('/api/downloadreceipt', async (req, res) => {
    const { html, email } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Subscription Receipt',
        html: html
    };

    transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log('Error', error);
            res.status(500).json({ success: false, message: 'Failed to send receipt' });
        } else {
            res.json({ success: true, message: 'Receipt sent to your mail' });
        }
    });

});

//SEND RECEIPT
app.post('/api/sendreceipt', async (req, res) => {
    const { html, email, plan, subscriberId, user, method, subscription } = req.body;
    console.log(subscriberId, subscription);
    const existingSubscription = await Subscription.findOne({ user: user });
    if (existingSubscription) {
        //DO NOTHING
    } else {
        const newSub = new Subscription({ user, subscription, subscriberId, plan, method });
        await newSub.save();
        console.log(newSub);
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Subscription Payment',
        html: html
    };

    transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log('Error', error);
            res.status(500).json({ success: false, message: 'Failed to send receipt' });
        } else {
            res.json({ success: true, message: 'Receipt sent to your mail' });
        }
    });
});


//PAYPAL WEBHOOKS
app.post('/api/paypalwebhooks', async (req, res) => {

    const body = req.body;
    const event_type = body.event_type;

    switch (event_type) {
        case 'BILLING.SUBSCRIPTION.CANCELLED':
            const id = body['resource']['id'];
            updateSubsciption(id, "Cancelled");
            break;
        case 'BILLING.SUBSCRIPTION.EXPIRED':
            const id2 = body['resource']['id'];
            updateSubsciption(id2, "Expired");
            break;
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
            const id3 = body['resource']['id'];
            updateSubsciption(id3, "Suspended");
            break;
        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
            const id4 = body['resource']['id'];
            updateSubsciption(id4, "Disabled Due To Payment Failure");
            break;
        case 'PAYMENT.SALE.COMPLETED':
            const id5 = body['resource']['billing_agreement_id'];
            sendRenewEmail(id5);
            break;

        default:
        //DO NOTHING
    }

});

//SEND RENEW EMAIL
async function sendRenewEmail(id) {
    try {
        const subscriptionDetails = await Subscription.findOne({ subscription: id });
        const userId = subscriptionDetails.user;
        const userDetails = await User.findOne({ _id: userId });

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: userDetails.email,
            subject: `${userDetails.mName} Your Subscription Plan Has Been Renewed`,
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
            <html lang="en">
            
              <head></head>
             <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Subscription Renewed<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
             </div>
            
             <body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                  <tr style="width:100%">
                    <td>
                      <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                        <tbody>
                          <tr>
                            <td><img alt="Vercel" src="${process.env.LOGO}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                          </tr>
                        </tbody>
                      </table>
                      <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Subscription Renewed</h1>
                      <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">${userDetails.mName}, your subscription plan has been Renewed.</p>
                      <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                      </table>
                      <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${process.env.COMPANY}</strong> Team</p></p>
                      </td>
                  </tr>
                </table>
              </body>
            
            </html>`,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log('Error', error);
    }
}

//UPDATE SUBSCRIPTION DETIALS
async function updateSubsciption(id, subject) {
    try {
        const subscriptionDetails = await Subscription.findOne({ subscription: id });
        const userId = subscriptionDetails.user;

        await User.findOneAndUpdate(
            { _id: userId },
            { $set: { type: 'free' } }
        );

        const userDetails = await User.findOne({ _id: userId });
        await Subscription.findOneAndDelete({ subscription: id });

        sendCancelEmail(userDetails.email, userDetails.mName, subject);
    } catch (error) {
        console.log('Error', error);
    }
}

//SEND CANCEL EMAIL
async function sendCancelEmail(email, name, subject) {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const Reactivate = process.env.WEBSITE_URL + "/pricing";

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: `${name} Your Subscription Plan Has Been ${subject}`,
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        <html lang="en">
        
          <head></head>
         <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Subscription ${subject}<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
         </div>
        
<body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
              <tr style="width:100%">
                <td>
                  <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                    <tbody>
                      <tr>
                        <td><img alt="Vercel" src="${process.env.LOGO}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                      </tr>
                    </tbody>
                  </table>
                  <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Subscription ${subject}</h1>
                  <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">${name}, your subscription plan has been ${subject}. Reactivate your plan by clicking on the button below.</p>
                  <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                       <tbody>
                          <tr>
                            <td><a href="${Reactivate}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="p-x:20px;p-y:12px;max-width:100%;display:inline-block;line-height:120%;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:9px"</span><span>Reactivate</span></a></td>
                          </tr>
                        </tbody>
                  </table>
                  <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${process.env.COMPANY}</strong> Team</p></p>
                  </td>
              </tr>
            </table>
          </body>
        
        </html>`,
    };

    await transporter.sendMail(mailOptions);

}

//CANCEL PAYPAL SUBSCRIPTION
app.post('/api/paypalcancel', async (req, res) => {
    const { id, email } = req.body;

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
    await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${id}/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ "reason": "Not satisfied with the service" })

    }).then(async resp => {
        try {
            const subscriptionDetails = await Subscription.findOne({ subscriberId: email });
            const userId = subscriptionDetails.user;

            await User.findOneAndUpdate(
                { _id: userId },
                { $set: { type: 'free' } }
            );

            const userDetails = await User.findOne({ _id: userId });
            await Subscription.findOneAndDelete({ subscription: id });

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                service: 'gmail',
                secure: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                },
            });

            const Reactivate = process.env.WEBSITE_URL + "/pricing";

            const mailOptions = {
                from: process.env.EMAIL,
                to: userDetails.email,
                subject: `${userDetails.mName} Your Subscription Plan Has Been Cancelled`,
                html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                <html lang="en">
                
                  <head></head>
                 <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Subscription Cancelled<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
                 </div>
                
<body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                      <tr style="width:100%">
                        <td>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                            <tbody>
                              <tr>
                                <td><img alt="Vercel" src="${process.env.LOGO}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                              </tr>
                            </tbody>
                          </table>
                          <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Subscription Cancelled</h1>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">${userDetails.mName}, your subscription plan has been Cancelled. Reactivate your plan by clicking on the button below.</p>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                               <tbody>
                                  <tr>
                                    <td><a href="${Reactivate}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="p-x:20px;p-y:12px;max-width:100%;display:inline-block;line-height:120%;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:9px"</span><span>Reactivate</span></a></td>
                                  </tr>
                                </tbody>
                          </table>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${process.env.COMPANY}</strong> Team</p></p>
                          </td>
                      </tr>
                    </table>
                  </body>
                
                </html>`,
            };

            await transporter.sendMail(mailOptions);
            res.json({ success: true, message: '' });

        } catch (error) {
            console.log('Error', error);
        }
    });

});

//UPDATE SUBSCRIPTION
app.post('/api/paypalupdate', async (req, res) => {
    const { id, idPlan } = req.body;

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");

    try {
        const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${id}/revise`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "plan_id": idPlan, "application_context": { "brand_name": process.env.COMPANY, "locale": "en-US", "payment_method": { "payer_selected": "PAYPAL", "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED" }, "return_url": `${process.env.WEBSITE_URL}/payment-success/${idPlan}`, "cancel_url": `${process.env.WEBSITE_URL}/payment-failed` } })
        });
        const session = await response.json();
        res.send(session)
    } catch (error) {
        console.log('Error', error);
    }

});

//UPDATE SUBSCRIPTION AND USER DETAILS
app.post('/api/paypalupdateuser', async (req, res) => {
    const { id, mName, email, user, plan } = req.body;

    await Subscription.findOneAndUpdate(
        { subscription: id },
        { $set: { plan: plan } }
    ).then(async r => {
        await User.findOneAndUpdate(
            { _id: user },
            { $set: { type: plan } }
        ).then(async ress => {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                service: 'gmail',
                secure: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: `${mName} Your Subscription Plan Has Been Modifed`,
                html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                <html lang="en">
    
                  <head></head>
                 <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Subscription Modifed<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
                 </div>
    
    <body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                      <tr style="width:100%">
                        <td>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                            <tbody>
                              <tr>
                                <td><img alt="Vercel" src="${process.env.LOGO}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                              </tr>
                            </tbody>
                          </table>
                          <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Subscription Modifed</h1>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">${mName}, your subscription plan has been Modifed.</p>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                          </table>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${process.env.COMPANY}</strong> Team</p></p>
                          </td>
                      </tr>
                    </table>
                  </body>
    
                </html>`,
            };

            await transporter.sendMail(mailOptions);
        })
    });

});

//CREATE RAZORPAY SUBSCRIPTION
app.post('/api/razorpaycreate', async (req, res) => {
    const { plan, email, fullAddress } = req.body;
    try {
        const YOUR_KEY_ID = process.env.RAZORPAY_KEY_ID;
        const YOUR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

        const requestBody = {
            plan_id: plan,
            total_count: 12,
            quantity: 1,
            customer_notify: 1,
            notes: {
                notes_key_1: fullAddress,
            },
            notify_info: {
                notify_email: email
            }
        };

        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: YOUR_KEY_ID,
                password: YOUR_KEY_SECRET
            }
        };

        const requestData = JSON.stringify(requestBody);

        axios.post('https://api.razorpay.com/v1/subscriptions', requestData, config)
            .then(response => {
                res.send(response.data);
            })
            .catch(error => {
                console.log('Error', error);
            });

    } catch (error) {
        console.log('Error', error);
    }

});

//GET RAZORPAY SUBSCRIPTION DETAILS
app.post('/api/razorapydetails', async (req, res) => {

    const { subscriberId, uid, plan } = req.body;

    let cost = 0;
    if (plan === process.env.MONTH_TYPE) {
        cost = process.env.MONTH_COST
    } else {
        cost = process.env.YEAR_COST
    }
    cost = cost / 4;

    await Admin.findOneAndUpdate(
        { type: 'main' },
        { $inc: { total: cost } }
    );

    await User.findOneAndUpdate(
        { _id: uid },
        { $set: { type: plan } }
    ).then(async result => {

        const YOUR_KEY_ID = process.env.RAZORPAY_KEY_ID;
        const YOUR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
        const SUBSCRIPTION_ID = subscriberId;

        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: YOUR_KEY_ID,
                password: YOUR_KEY_SECRET
            }
        };

        axios.get(`https://api.razorpay.com/v1/subscriptions/${SUBSCRIPTION_ID}`, config)
            .then(response => {
                res.send(response.data);
            })
            .catch(error => {
                //DO NOTHING
            });

    }).catch(error => {
        res.status(500).json({ success: false, message: 'Internal server error' });
    })

});

//RAZORPAY PENDING
app.post('/api/razorapypending', async (req, res) => {

    const { sub } = req.body;

    const YOUR_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const YOUR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const SUBSCRIPTION_ID = sub;

    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: YOUR_KEY_ID,
            password: YOUR_KEY_SECRET
        }
    };

    axios.get(`https://api.razorpay.com/v1/subscriptions/${SUBSCRIPTION_ID}`, config)
        .then(response => {
            res.send(response.data);
        })
        .catch(error => {
            console.log('Error', error);
        });

});

//RAZORPAY CANCEL SUBSCRIPTION 
app.post('/api/razorpaycancel', async (req, res) => {
    const { id, email } = req.body;

    const YOUR_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const YOUR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const SUBSCRIPTION_ID = id;

    const requestBody = {
        cancel_at_cycle_end: 0
    };

    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: YOUR_KEY_ID,
            password: YOUR_KEY_SECRET
        }
    };

    axios.post(`https://api.razorpay.com/v1/subscriptions/${SUBSCRIPTION_ID}/cancel`, requestBody, config)
        .then(async resp => {
            try {
                const subscriptionDetails = await Subscription.findOne({ subscriberId: email });
                const userId = subscriptionDetails.user;

                await User.findOneAndUpdate(
                    { _id: userId },
                    { $set: { type: 'free' } }
                );

                const userDetails = await User.findOne({ _id: userId });
                await Subscription.findOneAndDelete({ subscription: id });

                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    service: 'gmail',
                    secure: true,
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD,
                    },
                });

                const Reactivate = process.env.WEBSITE_URL + "/pricing";

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: userDetails.email,
                    subject: `${userDetails.mName} Your Subscription Plan Has Been Cancelled`,
                    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                    <html lang="en">
                    
                      <head></head>
                     <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Subscription Cancelled<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
                     </div>
                    
<body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                          <tr style="width:100%">
                            <td>
                              <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                                <tbody>
                                  <tr>
                                    <td><img alt="Vercel" src="${process.env.LOGO}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                                  </tr>
                                </tbody>
                              </table>
                              <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Subscription Cancelled</h1>
                              <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">${userDetails.mName}, your subscription plan has been Cancelled. Reactivate your plan by clicking on the button below.</p>
                              <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                                   <tbody>
                                      <tr>
                                        <td><a href="${Reactivate}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="p-x:20px;p-y:12px;max-width:100%;display:inline-block;line-height:120%;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:9px"</span><span>Reactivate</span></a></td>
                                      </tr>
                                    </tbody>
                              </table>
                              <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${process.env.COMPANY}</strong> Team</p></p>
                              </td>
                          </tr>
                        </table>
                      </body>
                    
                    </html>`,
                };

                await transporter.sendMail(mailOptions);
                res.json({ success: true, message: '' });

            } catch (error) {
                console.log('Error', error);
            }
        })
        .catch(error => {
            console.log('Error', error);
        });
});

//CONTACT
app.post('/api/contact', async (req, res) => {
    const { fname, lname, email, phone, msg } = req.body;
    try {
        const newContact = new Contact({ fname, lname, email, phone, msg });
        await newContact.save();
        res.json({ success: true, message: 'Submitted' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//ADMIN PANEL

//DASHBOARD
app.post('/api/dashboard', async (req, res) => {
    const users = await User.estimatedDocumentCount();
    const courses = await Course.estimatedDocumentCount();
    const admin = await Admin.findOne({ type: 'main' });
    const total = admin.total;
    const monthlyPlanCount = await User.countDocuments({ type: process.env.MONTH_TYPE });
    const yearlyPlanCount = await User.countDocuments({ type: process.env.YEAR_TYPE });
    let monthCost = monthlyPlanCount * process.env.MONTH_COST;
    let yearCost = yearlyPlanCount * process.env.YEAR_COST;
    let sum = monthCost + yearCost;
    let paid = yearlyPlanCount + monthlyPlanCount;
    const videoType = await Course.countDocuments({ type: 'video & text course' });
    const textType = await Course.countDocuments({ type: 'theory & image course' });
    let free = users - paid;
    res.json({ users: users, courses: courses, total: total, sum: sum, paid: paid, videoType: videoType, textType: textType, free: free, admin: admin });
});

//GET USERS
app.get('/api/getusers', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.log('Error', error);
    }
});

//GET COURES
app.get('/api/getcourses', async (req, res) => {
    try {
        // Obtener cursos tradicionales
        const courses = await Course.find({});
        
        // Obtener cursos JSON activos
        const jsonCourses = await JsonCourse.find({ active: true });
        
        // Transformar cursos JSON para que sean compatibles con la vista actual
        const transformedJsonCourses = jsonCourses.map(course => ({
            _id: course._id,
            user: course.user,
            mainTopic: course.title,
            type: course.type,
            completed: course.completed,
            date: course.date,
            // Agregar datos adicionales para identificar cursos JSON
            isJsonCourse: true,
            category: course.category,
            level: course.level,
            duration: course.duration,
            instructor: course.instructor
        }));
        
        // Combinar ambos tipos de cursos
        const allCourses = [...courses, ...transformedJsonCourses];
        
        res.json(allCourses);
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

//GET PAID USERS
app.get('/api/getpaid', async (req, res) => {
    try {
        const paidUsers = await User.find({ type: { $ne: 'free' } });
        res.json(paidUsers);
    } catch (error) {
        console.log('Error', error);
    }
});

//GET ADMINS
app.get('/api/getadmins', async (req, res) => {
    try {
        const users = await User.find({ email: { $nin: await getEmailsOfAdmins() } });
        const admins = await Admin.find({});
        res.json({ users: users, admins: admins });
    } catch (error) {
        console.log('Error', error);
    }
});

async function getEmailsOfAdmins() {
    const admins = await Admin.find({});
    return admins.map(admin => admin.email);
}

//ADD ADMIN
app.post('/api/addadmin', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email });
        const paidUser = await Subscription.findOne({ user: user._id });
        if (!paidUser) {
            await User.findOneAndUpdate(
                { email: email },
                { $set: { type: 'forever' } }
            );
        }
        const newAdmin = new Admin({ email: user.email, mName: user.mName, type: 'no' });
        await newAdmin.save();
        res.json({ success: true, message: 'Admin added successfully' });
    } catch (error) {
        console.log('Error', error);
    }
});

//REMOVE ADMIN
app.post('/api/removeadmin', async (req, res) => {
    const { email } = req.body;
    try {
        await Admin.findOneAndDelete({ email: email });
        const user = await User.findOne({ email: email });
        if (user.type === 'forever') {
            await User.findOneAndUpdate(
                { email: email },
                { $set: { type: 'free' } }
            );
        }
        res.json({ success: true, message: 'Admin removed successfully' });
    } catch (error) {
        console.log('Error', error);
    }
});

//GET CONTACTS
app.get('/api/getcontact', async (req, res) => {
    try {
        const contacts = await Contact.find({});
        res.json(contacts);
    } catch (error) {
        console.log('Error', error);
    }
});

//SAVE ADMIN
app.post('/api/saveadmin', async (req, res) => {
    const { data, type } = req.body;
    try {
        if (type === 'terms') {
            await Admin.findOneAndUpdate(
                { type: 'main' },
                { $set: { terms: data } }
            ).then(rl => {
                res.json({ success: true, message: 'Saved successfully' });
            });
        } else if (type === 'privacy') {
            await Admin.findOneAndUpdate(
                { type: 'main' },
                { $set: { privacy: data } }
            ).then(rl => {
                res.json({ success: true, message: 'Saved successfully' });
            });
        } else if (type === 'cancel') {
            await Admin.findOneAndUpdate(
                { type: 'main' },
                { $set: { cancel: data } }
            ).then(rl => {
                res.json({ success: true, message: 'Saved successfully' });
            });
        } else if (type === 'refund') {
            await Admin.findOneAndUpdate(
                { type: 'main' },
                { $set: { refund: data } }
            ).then(rl => {
                res.json({ success: true, message: 'Saved successfully' });
            });
        } else if (type === 'billing') {
            await Admin.findOneAndUpdate(
                { type: 'main' },
                { $set: { billing: data } }
            ).then(rl => {
                res.json({ success: true, message: 'Saved successfully' });
            });
        }
    } catch (error) {
        console.log('Error', error);
    }
});

//GET POLICIES
app.get('/api/policies', async (req, res) => {
    try {
        const admins = await Admin.find({});
        res.json(admins);
    } catch (error) {
        console.log('Error', error);
    }
});

//STRIPE PAYMENT
app.post('/api/stripepayment', async (req, res) => {
    const { planId } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            success_url: `${process.env.WEBSITE_URL}/payment-success/${planId}`,
            cancel_url: `${process.env.WEBSITE_URL}/payment-failed`,
            line_items: [
                {
                    price: planId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
        });

        res.json({ url: session.url, id: session.id })
    } catch (e) {
        console.log('Error', e);
        res.status(500).json({ error: e.message })
    }

});

app.post('/api/stripedetails', async (req, res) => {
    const { subscriberId, uid, plan } = req.body;

    let cost = 0;
    if (plan === process.env.MONTH_TYPE) {
        cost = process.env.MONTH_COST
    } else {
        cost = process.env.YEAR_COST
    }
    cost = cost / 4;

    await Admin.findOneAndUpdate(
        { type: 'main' },
        { $inc: { total: cost } }
    );

    await User.findOneAndUpdate(
        { _id: uid },
        { $set: { type: plan } }
    ).then(async result => {
        const session = await stripe.checkout.sessions.retrieve(subscriberId);
        res.send(session);
    }).catch(error => {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    })

});

app.post('/api/stripecancel', async (req, res) => {
    const { id, email } = req.body;

    const subscription = await stripe.subscriptions.cancel(
        id
    );

    try {
        const subscriptionDetails = await Subscription.findOne({ subscriberId: email });
        const userId = subscriptionDetails.user;

        await User.findOneAndUpdate(
            { _id: userId },
            { $set: { type: 'free' } }
        );

        const userDetails = await User.findOne({ _id: userId });
        await Subscription.findOneAndDelete({ subscriberId: id });

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const Reactivate = process.env.WEBSITE_URL + "/pricing";

        const mailOptions = {
            from: process.env.EMAIL,
            to: userDetails.email,
            subject: `${userDetails.mName} Your Subscription Plan Has Been Cancelled`,
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                <html lang="en">
                
                  <head></head>
                 <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Subscription Cancelled<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
                 </div>

<body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                      <tr style="width:100%">
                        <td>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                            <tbody>
                              <tr>
                                <td><img alt="Vercel" src="${process.env.LOGO}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                              </tr>
                            </tbody>
                          </table>
                          <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Subscription Cancelled</h1>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">${userDetails.mName}, your subscription plan has been Cancelled. Reactivate your plan by clicking on the button below.</p>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                               <tbody>
                                  <tr>
                                    <td><a href="${Reactivate}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="p-x:20px;p-y:12px;max-width:100%;display:inline-block;line-height:120%;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:9px"</span><span>Reactivate</span></a></td>
                                  </tr>
                                </tbody>
                          </table>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${process.env.COMPANY}</strong> Team</p></p>
                          </td>
                      </tr>
                    </table>
                  </body>
                
                </html>`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: '' });

    } catch (error) {
        console.log('Error', error);
    }

});

//MERCADOPAGO PAYMENT
app.post('/api/mercadopago', async (req, res) => {
    const { planId, email, firstName, lastName, address, city, state, zipCode, country } = req.body;
    
    try {
        // Calculate the amount based on the plan
        let amount = 0;
        let title = '';
        if (planId === process.env.MERCADOPAGO_PLAN_ID_ONE) {
            amount = parseFloat(process.env.MONTH_COST);
            title = process.env.MONTH_TYPE;
        } else {
            amount = parseFloat(process.env.YEAR_COST);
            title = process.env.YEAR_TYPE;
        }

        // Create a preference object for the payment
        const preference = new Preference(mercadopagoClient);
        
        const preferenceData = {
            items: [
                {
                    title: title,
                    quantity: 1,
                    unit_price: amount,
                    currency_id: 'USD'
                }
            ],
            payer: {
                name: firstName,
                surname: lastName,
                email: email,
                address: {
                    street_name: address,
                    zip_code: zipCode
                }
            },
            back_urls: {
                success: `${process.env.WEBSITE_URL}/payment-success/${planId}?payment_id={PAYMENT_ID}`,
                failure: `${process.env.WEBSITE_URL}/payment-failed`,
                pending: `${process.env.WEBSITE_URL}/payment-pending`
            },
            auto_return: 'approved',
            statement_descriptor: process.env.COMPANY_NAME,
            external_reference: planId,
            notification_url: `${process.env.SERVER_URL}/api/mercadopagowebhooks`
        };

        const response = await preference.create({ body: preferenceData });
        
        res.json({ 
            id: response.id, 
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point 
        });
    } catch (error) {
        console.log('MercadoPago Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/mercadopagodetails', async (req, res) => {
    const { paymentId, uid, plan } = req.body;
    
    try {
        // Get payment details from MercadoPago
        const payment = new Payment(mercadopagoClient);
        const paymentData = await payment.get({ id: paymentId });
        
        if (paymentData.status === 'approved') {
            let cost = 0;
            if (plan === process.env.MONTH_TYPE) {
                cost = process.env.MONTH_COST;
            } else {
                cost = process.env.YEAR_COST;
            }
            cost = cost / 4;

            await Admin.findOneAndUpdate(
                { type: 'main' },
                { $inc: { total: cost } }
            );

            await User.findOneAndUpdate(
                { _id: uid },
                { $set: { type: plan } }
            ).then(result => {
                res.json({ success: true, payment: paymentData });
            }).catch(error => {
                console.log('Error updating user:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            });
        } else {
            res.status(400).json({ success: false, message: 'Payment not approved' });
        }
    } catch (error) {
        console.log('MercadoPago Details Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/mercadopagowebhooks', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const payment = new Payment(mercadopagoClient);
            const paymentData = await payment.get({ id: data.id });
            
            if (paymentData.status === 'approved') {
                // Find user by email and update subscription
                const email = paymentData.payer.email;
                const externalReference = paymentData.external_reference;
                
                let planType = '';
                if (externalReference === process.env.MERCADOPAGO_PLAN_ID_ONE) {
                    planType = process.env.MONTH_TYPE;
                } else if (externalReference === process.env.MERCADOPAGO_PLAN_ID_TWO) {
                    planType = process.env.YEAR_TYPE;
                }
                
                if (planType) {
                    await User.findOneAndUpdate(
                        { email: email },
                        { $set: { type: planType } }
                    );
                }
            }
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.log('MercadoPago Webhook Error:', error);
        res.sendStatus(500);
    }
});

app.post('/api/mercadopagocancel', async (req, res) => {
    const { uid } = req.body;
    
    try {
        await User.findOneAndUpdate(
            { _id: uid },
            { $set: { type: process.env.FREE_TYPE } }
        ).then(result => {
            res.json({ success: true, message: 'Subscription cancelled successfully' });
        }).catch(error => {
            console.log('Error cancelling subscription:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
    } catch (error) {
        console.log('MercadoPago Cancel Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

//PAYSTACK PAYMENT
app.post('/api/paystackpayment', async (req, res) => {
    const { planId, amountInZar, email } = req.body;
    try {

        const data = {
            email: email,
            amount: amountInZar,
            plan: planId
        };

        axios.post('https://api.paystack.co/transaction/initialize', data, {
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.data.status) {
                    const authorizationUrl = response.data.data.authorization_url;
                    res.json({ url: authorizationUrl });
                } else {
                    res.status(500).json({ error: 'Internal Server Error' })
                }
            })
            .catch(error => {
                res.status(500).json({ error: 'Internal Server Error' })
            });
    } catch (e) {
        console.log('Error', e);
        res.status(500).json({ error: e.message })
    }

});

//PAYSTACK GET DETAIL
app.post('/api/paystackfetch', async (req, res) => {
    const { email, uid, plan } = req.body;
    try {

        const searchEmail = email;
        const url = "https://api.paystack.co/subscription";
        const authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;

        axios.get(url, {
            headers: {
                'Authorization': authorization
            }
        })
            .then(async response => {
                const jsonData = response.data;
                let subscriptionDetails = null;
                jsonData.data.forEach(subscription => {
                    if (subscription.customer.email === searchEmail) {
                        subscriptionDetails = {
                            subscription_code: subscription.subscription_code,
                            createdAt: subscription.createdAt,
                            updatedAt: subscription.updatedAt,
                            customer_code: subscription.customer.customer_code
                        };
                    }
                });

                if (subscriptionDetails) {

                    let cost = 0;
                    if (plan === process.env.MONTH_TYPE) {
                        cost = process.env.MONTH_COST
                    } else {
                        cost = process.env.YEAR_COST
                    }
                    cost = cost / 4;

                    await Admin.findOneAndUpdate(
                        { type: 'main' },
                        { $inc: { total: cost } }
                    );

                    await User.findOneAndUpdate(
                        { _id: uid },
                        { $set: { type: plan } }
                    ).then(async result => {
                        res.json({ details: subscriptionDetails });
                    }).catch(error => {
                        console.log('Error', error);
                        res.status(500).json({ success: false, message: 'Internal server error' });
                    })

                } else {
                    res.status(500).json({ error: 'Internal Server Error' })
                }
            })
            .catch(error => {
                console.log('Error', error);
                res.status(500).json({ error: 'Internal Server Error' })
            });


    } catch (e) {
        console.log('Error', e);
        res.status(500).json({ error: 'Internal Server Error' })
    }

});

//PAYSTACK PAYMENT
app.post('/api/paystackcancel', async (req, res) => {
    const { code, token, email } = req.body;

    const url = "https://api.paystack.co/subscription/disable";
    const authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
    const contentType = "application/json";
    const data = {
        code: code,
        token: token
    };

    axios.post(url, data, {
        headers: {
            Authorization: authorization,
            'Content-Type': contentType
        }
    }).then(async response => {
        const subscriptionDetails = await Subscription.findOne({ subscriberId: email });
        const userId = subscriptionDetails.user;

        await User.findOneAndUpdate(
            { _id: userId },
            { $set: { type: 'free' } }
        );

        const userDetails = await User.findOne({ _id: userId });
        await Subscription.findOneAndDelete({ subscriberId: code });

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const Reactivate = process.env.WEBSITE_URL + "/pricing";

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `${userDetails.mName} Your Subscription Plan Has Been Cancelled`,
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                <html lang="en">
                
                  <head></head>
                 <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Subscription Cancelled<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
                 </div>
                
                  <body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                      <tr style="width:100%">
                        <td>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                            <tbody>
                              <tr>
                                <td><img alt="Vercel" src="${process.env.LOGO}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                              </tr>
                            </tbody>
                          </table>
                          <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Subscription Cancelled</h1>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">${userDetails.mName}, your subscription plan has been Cancelled. Reactivate your plan by clicking on the button below.</p>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                               <tbody>
                                  <tr>
                                    <td><a href="${Reactivate}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="p-x:20px;p-y:12px;max-width:100%;display:inline-block;line-height:120%;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:9px"</span><span>Reactivate</span></a></td>
                                  </tr>
                                </tbody>
                          </table>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${process.env.COMPANY}</strong> Team</p></p>
                          </td>
                      </tr>
                    </table>
                  </body>
                </html>`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: '' });
    })

});


//FLUTTERWAVE PAYMENT
app.post('/api/flutterwavecancel', async (req, res) => {
    const { code, token, email } = req.body;

    const payload = { "id": code };
    const response = await flw.Subscription.cancel(payload)
    if (response) {
        const subscriptionDetails = await Subscription.findOne({ subscriberId: email });
        const userId = subscriptionDetails.user;

        await User.findOneAndUpdate(
            { _id: userId },
            { $set: { type: 'free' } }
        );

        const userDetails = await User.findOne({ _id: userId });
        await Subscription.findOneAndDelete({ subscriberId: token });

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const Reactivate = process.env.WEBSITE_URL + "/pricing";

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `${userDetails.mName} Your Subscription Plan Has Been Cancelled`,
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                <html lang="en">
                
                  <head></head>
                 <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Subscription Cancelled<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
                 </div>
                
<body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                      <tr style="width:100%">
                        <td>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                            <tbody>
                              <tr>
                                <td><img alt="Vercel" src="${process.env.LOGO}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                              </tr>
                            </tbody>
                          </table>
                          <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Subscription Cancelled</h1>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">${userDetails.mName}, your subscription plan has been Cancelled. Reactivate your plan by clicking on the button below.</p>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                               <tbody>
                                  <tr>
                                    <td><a href="${Reactivate}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="p-x:20px;p-y:12px;max-width:100%;display:inline-block;line-height:120%;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:9px"</span><span>Reactivate</span></a></td>
                                  </tr>
                                </tbody>
                          </table>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${process.env.COMPANY}</strong> Team</p></p>
                          </td>
                      </tr>
                    </table>
                  </body>
                
                </html>`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: '' });
    } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


//CHAT
app.post('/api/chat', async (req, res) => {
    const receivedData = req.body;

    const promptString = receivedData.prompt;

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

    const prompt = promptString;

    await model.generateContent(prompt).then(result => {
        const response = result.response;
        const txt = response.text();
        const converter = new showdown.Converter();
        const markdownText = txt;
        const text = converter.makeHtml(markdownText);
        res.status(200).json({ text });
    }).catch(error => {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    })

});


//FLUTTERWAVE GET DETAILS
app.post('/api/flutterdetails', async (req, res) => {
    const { email, uid, plan } = req.body;
    try {
        let cost = 0;
        if (plan === process.env.MONTH_TYPE) {
            cost = process.env.MONTH_COST
        } else {
            cost = process.env.YEAR_COST
        }
        cost = cost / 4;

        await Admin.findOneAndUpdate(
            { type: 'main' },
            { $inc: { total: cost } }
        );

        await User.findOneAndUpdate(
            { _id: uid },
            { $set: { type: plan } }
        ).then(async result => {

            const payload = { "email": email };
            const response = await flw.Subscription.get(payload);

            res.send(response['data'][0]);
        }).catch(error => {
            console.log('Error', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        })
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET NOTES
app.post('/api/getnotes', async (req, res) => {
    const { course } = req.body;
    try {
        const existingNotes = await NotesSchema.findOne({ course: course });
        if (existingNotes) {
            res.json({ success: true, message: existingNotes.notes });
        } else {
            res.json({ success: false, message: '' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//SAVE NOTES
app.post('/api/savenotes', async (req, res) => {
    const { course, notes } = req.body;
    try {
        const existingNotes = await NotesSchema.findOne({ course: course });

        if (existingNotes) {
            await NotesSchema.findOneAndUpdate(
                { course: course },
                { $set: { notes: notes } }
            );
            res.json({ success: true, message: 'Notes updated successfully' });
        } else {
            const newNotes = new NotesSchema({ course: course, notes: notes });
            await newNotes.save();
            res.json({ success: true, message: 'Notes created successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GENERATE EXAMS
app.post('/api/aiexam', async (req, res) => {
    const { courseId, mainTopic, subtopicsString, lang } = req.body;

    const existingNotes = await ExamSchema.findOne({ course: courseId });
    if (existingNotes) {
        res.json({ success: true, message: existingNotes.exam });
    } else {

        const prompt = `Strictly in ${lang},
        generate a strictly 10 question MCQ quiz on title ${mainTopic} based on each topics :- ${subtopicsString}, Atleast One question per topic. Add options A, B, C, D and only one correct answer. Give your repones Strictly inJSON format like this :-
        {
          "${mainTopic}": [
            {
              "topic": "topic title",
              "question": "",
              "options": [
               "",
               "",
               "",
               ""
              ],
              "answer": "correct option like A, B, C, D"
            },
            {
              "topic": "topic title",
              "question": "",
              "options": [
               "",
               "",
               "",
               ""
              ],
              "answer": "correct option like A, B, C, D"
            },
            {
              "topic": "topic title",
              "question": "",
              "options": [
               "",
               "",
               "",
               ""
              ],
              "answer": "correct option like A, B, C, D"
            }
          ]
        }
        `;

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ];

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

        await model.generateContent(prompt).then(async result => {
            const response = result.response;
            const txt = response.text();
            let output = txt.slice(7, txt.length - 4);

            const newNotes = new ExamSchema({ course: courseId, exam: output, marks: "0", passed: false });
            await newNotes.save();
            res.json({ success: true, message: output });

        }).catch(error => {
            console.log(error);
            res.json({ success: false });
        })

    }

});

//UPDATE RESULT
app.post('/api/updateresult', async (req, res) => {
    const { courseId, marksString } = req.body;
    try {

        await ExamSchema.findOneAndUpdate(
            { course: courseId },
            [{ $set: { marks: marksString, passed: true } }]
        ).then(result => {
            res.json({ success: true });
        }).catch(error => {
            res.json({ success: false });
        })

    } catch (error) {
        console.log('Error', error);
        res.status(500).send('Internal Server Error');
    }
});

//SEND EXAM
app.post('/api/sendexammail', async (req, res) => {
    const { html, email, subjects } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: '' + subjects,
        html: html
    };

    transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log('Error', error);
            res.status(500).json({ success: false, message: 'Failed to send email' });
        } else {
            res.json({ success: true, message: 'Email sent successfully' });
        }
    });
});

//GET RESULT
app.post('/api/getmyresult', async (req, res) => {
    const { courseId } = req.body;
    try {

        const existingNotes = await ExamSchema.findOne({ course: courseId });
        const lang = await LangSchema.findOne({ course: courseId });
        if (existingNotes) {
            if (lang) {
                res.json({ success: true, message: existingNotes.passed, lang: lang.lang });
            } else {
                res.json({ success: true, message: existingNotes.passed, lang: 'English' });
            }
        } else {
            if (lang) {
                res.json({ success: false, message: false, lang: lang.lang });
            } else {
                res.json({ success: false, message: false, lang: 'English' });
            }
        }

    } catch (error) {
        console.log('Error', error);
        res.status(500).send('Internal Server Error');
    }
});

//DELETE
app.post('/api/deleteuser', async (req, res) => {
    try {
        const { userId } = req.body;;
        const deletedUser = await User.findOneAndDelete({ _id: userId });

        if (!deletedUser) {
            return res.json({ success: false, message: 'Internal Server Error' });
        }

        await Course.deleteMany({ user: userId });
        await Subscription.deleteMany({ user: userId });

        return res.json({ success: true, message: 'Profile deleted successfully' });

    } catch (error) {
        console.log('Error', error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});

//CREATE Blog
app.post('/api/createblog', async (req, res) => {
    try {
        const { title, excerpt, content, image, category, tags } = req.body;
        const buffer = Buffer.from(image.split(',')[1], 'base64');
        const blogs = new BlogSchema({ title: title, excerpt: excerpt, content: content, image: buffer, category: category, tags: tags });
        await blogs.save();
        res.json({ success: true, message: 'Blog created successfully' });

    } catch (error) {
        console.log('Error', error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});

//DELETE Blog
app.post('/api/deleteblogs', async (req, res) => {
    try {
        const { id } = req.body;
        await BlogSchema.findOneAndDelete({ _id: id });
        res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});


//UPDATE Blog
app.post('/api/updateblogs', async (req, res) => {
    try {
        const { id, type, value } = req.body;
        const booleanValue = value === 'true' ? true : false;
        if (type === 'popular') {
            await BlogSchema.findOneAndUpdate({ _id: id },
                { $set: { popular: booleanValue } }
            );
        } else {
            await BlogSchema.findOneAndUpdate({ _id: id },
                { $set: { featured: booleanValue } }
            );
        }
        res.json({ success: true, message: 'Blog updated successfully' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});

//GET Blog
app.get('/api/getblogs', async (req, res) => {
    try {
        const blogs = await BlogSchema.find({});
        res.json(blogs);
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});

//UPLOAD JSON COURSE
app.post('/api/upload-course', async (req, res) => {
    try {
        const { courseData, user } = req.body;
        
        // Validar que los datos requeridos estén presentes
        if (!courseData || !courseData.title || !courseData.description || !courseData.modules) {
            return res.json({ success: false, message: 'Datos del curso incompletos' });
        }
        
        // Crear el nuevo curso JSON
        const newJsonCourse = new JsonCourse({
            user: user || 'admin',
            title: courseData.title,
            description: courseData.description,
            category: courseData.category,
            level: courseData.level,
            duration: courseData.duration,
            language: courseData.language || 'es',
            instructor: courseData.instructor,
            thumbnail: courseData.thumbnail,
            modules: courseData.modules,
            finalQuiz: courseData.finalQuiz,
            requirements: courseData.requirements || [],
            objectives: courseData.objectives || [],
            tags: courseData.tags || [],
            mainTopic: courseData.title,
            type: 'json_course',
            completed: true,
            active: true
        });
        
        // Guardar en la base de datos
        await newJsonCourse.save();
        
        // También crear una entrada en el schema Course original para mantener compatibilidad
        const courseContent = JSON.stringify(courseData);
        const newCourse = new Course({
            user: user || 'admin',
            content: courseContent,
            type: 'json_course',
            mainTopic: courseData.title,
            photo: courseData.thumbnail || '',
            completed: true
        });
        
        await newCourse.save();
        
        res.json({ 
            success: true, 
            message: 'Curso subido exitosamente',
            courseId: newJsonCourse._id
        });
        
    } catch (error) {
        console.error('Error uploading JSON course:', error);
        return res.json({ 
            success: false, 
            message: 'Error interno del servidor: ' + error.message 
        });
    }
});

//GET JSON COURSES
app.get('/api/getjsoncourses', async (req, res) => {
    try {
        const jsonCourses = await JsonCourse.find({ active: true }).sort({ date: -1 });
        res.json(jsonCourses);
    } catch (error) {
        console.error('Error getting JSON courses:', error);
        return res.json({ success: false, message: 'Error interno del servidor' });
    }
});

//GET SINGLE JSON COURSE
app.get('/api/getjsoncourse/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const jsonCourse = await JsonCourse.findById(id);
        
        if (!jsonCourse) {
            return res.json({ success: false, message: 'Curso no encontrado' });
        }
        
        res.json({ success: true, course: jsonCourse });
    } catch (error) {
        console.error('Error getting JSON course:', error);
        return res.json({ success: false, message: 'Error interno del servidor' });
    }
});

//DELETE JSON COURSE
app.post('/api/deletejsoncourse', async (req, res) => {
    try {
        const { courseId } = req.body;
        
        // Marcar como inactivo en lugar de eliminar
        await JsonCourse.findByIdAndUpdate(courseId, { active: false });
        
        // También eliminar de la tabla Course original si existe
        await Course.findOneAndDelete({ 
            mainTopic: (await JsonCourse.findById(courseId)).title,
            type: 'json_course'
        });
        
        res.json({ success: true, message: 'Curso eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting JSON course:', error);
        return res.json({ success: false, message: 'Error interno del servidor' });
    }
});

//UPDATE JSON COURSE STATUS
app.post('/api/updatejsoncourse', async (req, res) => {
    try {
        const { courseId, field, value } = req.body;
        
        const updateData = {};
        updateData[field] = value;
        
        await JsonCourse.findByIdAndUpdate(courseId, updateData);
        
        res.json({ success: true, message: 'Curso actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating JSON course:', error);
        return res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// ===============================
// SISTEMA DE PROGRESO Y GAMIFICACIÓN
// ===============================

// Funciones auxiliares para gamificación
const calculateLevel = (xp) => {
    // Cada nivel requiere más XP: nivel 1 = 0-99, nivel 2 = 100-299, nivel 3 = 300-599, etc.
    return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const getXpForNextLevel = (currentLevel) => {
    return (currentLevel * currentLevel) * 100;
};

const addXpToUser = async (userId, xpAmount, actionType, details = {}) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const oldLevel = user.level;
        user.xp += xpAmount;
        user.level = calculateLevel(user.xp);
        
        // Registrar actividad
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let activity = await UserActivity.findOne({
            userId: userId,
            date: today
        });
        
        if (!activity) {
            activity = new UserActivity({
                userId: userId,
                date: today,
                actions: [],
                totalXpEarned: 0
            });
        }
        
        activity.actions.push({
            type: actionType,
            details: details,
            xpEarned: xpAmount
        });
        activity.totalXpEarned += xpAmount;
        
        if (actionType === 'lesson_completed') {
            activity.lessonsCompleted += 1;
            user.totalLessonsCompleted += 1;
        } else if (actionType === 'quiz_completed') {
            activity.quizzesCompleted += 1;
        }
        
        await activity.save();
        await user.save();
        
        // Verificar si subió de nivel
        const leveledUp = user.level > oldLevel;
        
        // Verificar logros
        await checkAchievements(userId);
        
        return { user, leveledUp, oldLevel };
    } catch (error) {
        console.error('Error adding XP:', error);
        return null;
    }
};

const checkAchievements = async (userId) => {
    try {
        const user = await User.findById(userId).populate('achievements');
        const userAchievements = user.achievements.map(a => a.key);
        const allAchievements = await Achievement.find({ active: true });
        
        for (const achievement of allAchievements) {
            if (userAchievements.includes(achievement.key)) continue;
            
            let unlocked = false;
            
            switch (achievement.criteria.type) {
                case 'courses_completed':
                    unlocked = user.totalCoursesCompleted >= achievement.criteria.value;
                    break;
                case 'lessons_completed':
                    unlocked = user.totalLessonsCompleted >= achievement.criteria.value;
                    break;
                case 'streak_days':
                    unlocked = user.streak >= achievement.criteria.value;
                    break;
                case 'login_time':
                    const hour = new Date().getHours();
                    if (achievement.criteria.timeCondition === 'night') {
                        unlocked = hour >= 22 || hour <= 5;
                    } else if (achievement.criteria.timeCondition === 'early') {
                        unlocked = hour >= 5 && hour <= 8;
                    }
                    break;
            }
            
            if (unlocked) {
                user.achievements.push(achievement._id);
                user.xp += achievement.xpReward;
                user.level = calculateLevel(user.xp);
                await user.save();
                
                // Registrar el logro en la actividad
                await addXpToUser(userId, achievement.xpReward, 'achievement_unlocked', {
                    achievementKey: achievement.key,
                    achievementTitle: achievement.title
                });
            }
        }
    } catch (error) {
        console.error('Error checking achievements:', error);
    }
};

const updateStreak = async (userId) => {
    try {
        const user = await User.findById(userId);
        const now = new Date();
        const lastLogin = new Date(user.lastLogin);
        
        // Calcular diferencia en días
        const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            // Consecutivo, incrementar racha
            user.streak += 1;
        } else if (daysDiff > 1) {
            // Se rompió la racha
            user.streak = 1;
        }
        // Si daysDiff === 0, es el mismo día, no hacer nada
        
        user.lastLogin = now;
        await user.save();
        
        return user.streak;
    } catch (error) {
        console.error('Error updating streak:', error);
        return 0;
    }
};

// INSCRIBIR USUARIO EN CURSO
app.post('/api/enrollment/enroll', async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        
        // Verificar si ya está inscrito
        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) {
            return res.json({ success: false, message: 'Ya estás inscrito en este curso' });
        }
        
        // Verificar que el curso existe
        const course = await JsonCourse.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Curso no encontrado' });
        }
        
        // Crear inscripción
        const enrollment = new Enrollment({
            userId,
            courseId,
            progress: {
                completedLessons: [],
                completedQuizzes: [],
                currentModule: 1,
                currentLesson: 1
            }
        });
        
        await enrollment.save();
        
        // Dar XP por inscribirse
        await addXpToUser(userId, 10, 'course_enrolled', { courseTitle: course.title });
        
        res.json({ success: true, message: 'Inscripción exitosa', enrollmentId: enrollment._id });
    } catch (error) {
        console.error('Error enrolling user:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER PROGRESO DEL USUARIO EN UN CURSO
app.get('/api/enrollment/progress/:userId/:courseId', async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        
        const enrollment = await Enrollment.findOne({ userId, courseId })
            .populate('courseId')
            .populate('userId', 'mName email xp level streak');
            
        if (!enrollment) {
            return res.json({ success: false, message: 'No estás inscrito en este curso' });
        }
        
        res.json({ success: true, enrollment });
    } catch (error) {
        console.error('Error getting progress:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// MARCAR LECCIÓN COMO COMPLETADA
app.post('/api/enrollment/complete-lesson', async (req, res) => {
    try {
        const { userId, courseId, moduleId, lessonId } = req.body;
        
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.json({ success: false, message: 'No estás inscrito en este curso' });
        }
        
        // Verificar si ya está completada
        const alreadyCompleted = enrollment.progress.completedLessons.find(
            lesson => lesson.moduleId === moduleId && lesson.lessonId === lessonId
        );
        
        if (alreadyCompleted) {
            return res.json({ success: false, message: 'Lección ya completada' });
        }
        
        // Marcar como completada
        enrollment.progress.completedLessons.push({
            moduleId,
            lessonId,
            completedAt: new Date()
        });
        
        // Actualizar posición actual
        const course = await JsonCourse.findById(courseId);
        const currentModule = course.modules.find(m => m.id === moduleId);
        const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === lessonId);
        
        // Si es la última lección del módulo, avanzar al siguiente módulo
        if (currentLessonIndex === currentModule.lessons.length - 1) {
            const nextModuleIndex = course.modules.findIndex(m => m.id === moduleId) + 1;
            if (nextModuleIndex < course.modules.length) {
                enrollment.progress.currentModule = course.modules[nextModuleIndex].id;
                enrollment.progress.currentLesson = course.modules[nextModuleIndex].lessons[0].id;
            }
        } else {
            enrollment.progress.currentLesson = currentModule.lessons[currentLessonIndex + 1].id;
        }
        
        await enrollment.save();
        
        // Dar XP por completar lección
        const xpResult = await addXpToUser(userId, 25, 'lesson_completed', {
            courseTitle: course.title,
            moduleId,
            lessonId
        });
        
        res.json({ 
            success: true, 
            message: 'Lección completada',
            xpEarned: 25,
            leveledUp: xpResult?.leveledUp || false,
            newLevel: xpResult?.user.level
        });
    } catch (error) {
        console.error('Error completing lesson:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// COMPLETAR QUIZ
app.post('/api/enrollment/complete-quiz', async (req, res) => {
    try {
        const { userId, courseId, moduleId, quizId, answers, score, passed } = req.body;
        
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.json({ success: false, message: 'No estás inscrito en este curso' });
        }
        
        // Guardar resultado del quiz
        enrollment.progress.completedQuizzes.push({
            moduleId,
            quizId,
            completedAt: new Date(),
            score,
            passed,
            answers
        });
        
        await enrollment.save();
        
        // Dar XP basado en el score
        let xpEarned = passed ? 50 : 25;
        if (score >= 90) xpEarned += 25; // Bonus por excelencia
        
        const course = await JsonCourse.findById(courseId);
        const xpResult = await addXpToUser(userId, xpEarned, 'quiz_completed', {
            courseTitle: course.title,
            moduleId,
            score,
            passed
        });
        
        res.json({ 
            success: true, 
            message: 'Quiz completado',
            xpEarned,
            leveledUp: xpResult?.leveledUp || false,
            newLevel: xpResult?.user.level
        });
    } catch (error) {
        console.error('Error completing quiz:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// COMPLETAR CURSO
app.post('/api/enrollment/complete-course', async (req, res) => {
    try {
        const { userId, courseId, finalQuizScore, finalQuizPassed } = req.body;
        
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.json({ success: false, message: 'No estás inscrito en este curso' });
        }
        
        enrollment.completed = true;
        enrollment.completionDate = new Date();
        enrollment.finalQuizScore = finalQuizScore;
        enrollment.finalQuizPassed = finalQuizPassed;
        
        // Generar ID de certificado
        enrollment.certificateId = `CERT-${userId}-${courseId}-${Date.now()}`;
        
        await enrollment.save();
        
        // Actualizar estadísticas del usuario
        const user = await User.findById(userId);
        user.totalCoursesCompleted += 1;
        await user.save();
        
        // Dar XP por completar curso
        let xpEarned = 200;
        if (finalQuizPassed) xpEarned += 100;
        if (finalQuizScore >= 90) xpEarned += 50;
        
        const course = await JsonCourse.findById(courseId);
        const xpResult = await addXpToUser(userId, xpEarned, 'course_completed', {
            courseTitle: course.title,
            finalQuizScore,
            finalQuizPassed
        });
        
        res.json({ 
            success: true, 
            message: 'Curso completado',
            certificateId: enrollment.certificateId,
            xpEarned,
            leveledUp: xpResult?.leveledUp || false,
            newLevel: xpResult?.user.level
        });
    } catch (error) {
        console.error('Error completing course:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER PERFIL DE USUARIO CON ESTADÍSTICAS
app.get('/api/user/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId)
            .populate('achievements')
            .select('-password -resetPasswordToken -resetPasswordExpires');
            
        if (!user) {
            return res.json({ success: false, message: 'Usuario no encontrado' });
        }
        
        // Obtener cursos inscritos
        const enrollments = await Enrollment.find({ userId })
            .populate('courseId', 'title thumbnail category level duration')
            .sort({ enrollmentDate: -1 });
            
        // Calcular estadísticas adicionales
        const completedCourses = enrollments.filter(e => e.completed).length;
        const inProgressCourses = enrollments.filter(e => !e.completed).length;
        
        // XP para siguiente nivel
        const xpForNextLevel = getXpForNextLevel(user.level);
        const xpProgress = user.xp - getXpForNextLevel(user.level - 1);
        const xpNeeded = xpForNextLevel - user.xp;
        
        res.json({
            success: true,
            user: {
                ...user.toObject(),
                enrollments,
                stats: {
                    completedCourses,
                    inProgressCourses,
                    xpForNextLevel,
                    xpProgress,
                    xpNeeded
                }
            }
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// ACTUALIZAR RACHA DE LOGIN
app.post('/api/user/update-streak', async (req, res) => {
    try {
        const { userId } = req.body;
        
        const streak = await updateStreak(userId);
        await checkAchievements(userId);
        
        res.json({ success: true, streak });
    } catch (error) {
        console.error('Error updating streak:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER LEADERBOARD
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { type = 'xp', period = 'all' } = req.query;
        
        let query = {};
        let sortBy = {};
        
        if (type === 'xp') {
            sortBy = { xp: -1 };
        } else if (type === 'courses') {
            sortBy = { totalCoursesCompleted: -1 };
        } else if (type === 'streak') {
            sortBy = { streak: -1 };
        }
        
        const users = await User.find(query)
            .select('mName email xp level totalCoursesCompleted totalLessonsCompleted streak avatar')
            .sort(sortBy)
            .limit(50);
            
        res.json({ success: true, leaderboard: users });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER ACTIVIDAD RECIENTE DEL USUARIO
app.get('/api/user/activity/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 7 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        const activities = await UserActivity.find({
            userId,
            date: { $gte: startDate }
        }).sort({ date: -1 });
        
        res.json({ success: true, activities });
    } catch (error) {
        console.error('Error getting user activity:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// INICIALIZAR LOGROS POR DEFECTO
app.post('/api/achievements/initialize', async (req, res) => {
    try {
        const defaultAchievements = [
            {
                key: 'first_enrollment',
                title: 'Primer Paso',
                description: 'Inscríbete en tu primer curso',
                icon: '🎯',
                xpReward: 50,
                category: 'course',
                criteria: { type: 'custom', value: 1 },
                rarity: 'common'
            },
            {
                key: 'first_lesson',
                title: 'Aprendiz',
                description: 'Completa tu primera lección',
                icon: '📚',
                xpReward: 25,
                category: 'course',
                criteria: { type: 'lessons_completed', value: 1 },
                rarity: 'common'
            },
            {
                key: 'first_course',
                title: 'Graduado',
                description: 'Completa tu primer curso',
                icon: '🎓',
                xpReward: 200,
                category: 'course',
                criteria: { type: 'courses_completed', value: 1 },
                rarity: 'rare'
            },
            {
                key: 'streak_7',
                title: 'Constante',
                description: 'Mantén una racha de 7 días',
                icon: '🔥',
                xpReward: 100,
                category: 'streak',
                criteria: { type: 'streak_days', value: 7 },
                rarity: 'rare'
            },
            {
                key: 'streak_30',
                title: 'Dedicado',
                description: 'Mantén una racha de 30 días',
                icon: '💪',
                xpReward: 500,
                category: 'streak',
                criteria: { type: 'streak_days', value: 30 },
                rarity: 'epic'
            },
            {
                key: 'night_owl',
                title: 'Búho Nocturno',
                description: 'Completa una lección después de las 10 PM',
                icon: '🦉',
                xpReward: 75,
                category: 'special',
                criteria: { type: 'login_time', timeCondition: 'night' },
                rarity: 'rare'
            },
            {
                key: 'early_bird',
                title: 'Madrugador',
                description: 'Completa una lección antes de las 8 AM',
                icon: '🐦',
                xpReward: 75,
                category: 'special',
                criteria: { type: 'login_time', timeCondition: 'early' },
                rarity: 'rare'
            },
            {
                key: 'quiz_master',
                title: 'Maestro de Quizzes',
                description: 'Obtén 100% en 5 quizzes',
                icon: '🧠',
                xpReward: 150,
                category: 'quiz',
                criteria: { type: 'custom', value: 5 },
                rarity: 'epic'
            },
            {
                key: 'course_collector',
                title: 'Coleccionista',
                description: 'Completa 5 cursos',
                icon: '🏆',
                xpReward: 1000,
                category: 'course',
                criteria: { type: 'courses_completed', value: 5 },
                rarity: 'epic'
            },
            {
                key: 'knowledge_seeker',
                title: 'Buscador de Conocimiento',
                description: 'Completa 100 lecciones',
                icon: '🔍',
                xpReward: 300,
                category: 'course',
                criteria: { type: 'lessons_completed', value: 100 },
                rarity: 'rare'
            },
            {
                key: 'legend',
                title: 'Leyenda',
                description: 'Completa 10 cursos',
                icon: '👑',
                xpReward: 2000,
                category: 'course',
                criteria: { type: 'courses_completed', value: 10 },
                rarity: 'legendary'
            }
        ];

        for (const achievementData of defaultAchievements) {
            await Achievement.findOneAndUpdate(
                { key: achievementData.key },
                achievementData,
                { upsert: true, new: true }
            );
        }

        res.json({ success: true, message: 'Logros inicializados correctamente' });
    } catch (error) {
        console.error('Error initializing achievements:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER TODOS LOS LOGROS
app.get('/api/achievements', async (req, res) => {
    try {
        const achievements = await Achievement.find({ active: true }).sort({ rarity: 1, xpReward: 1 });
        res.json({ success: true, achievements });
    } catch (error) {
        console.error('Error getting achievements:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER LOGROS DE UN USUARIO
app.get('/api/user/achievements/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId).populate('achievements');
        if (!user) {
            return res.json({ success: false, message: 'Usuario no encontrado' });
        }
        
        const allAchievements = await Achievement.find({ active: true });
        const userAchievementKeys = user.achievements.map(a => a.key);
        
        const achievementsWithStatus = allAchievements.map(achievement => ({
            ...achievement.toObject(),
            unlocked: userAchievementKeys.includes(achievement.key),
            unlockedAt: user.achievements.find(a => a.key === achievement.key)?.unlockedAt || null
        }));
        
        res.json({ success: true, achievements: achievementsWithStatus });
    } catch (error) {
        console.error('Error getting user achievements:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER CURSOS DEL USUARIO (INSCRITOS)
app.get('/api/user/courses/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status = 'all' } = req.query; // all, completed, in_progress
        
        let query = { userId };
        if (status === 'completed') {
            query.completed = true;
        } else if (status === 'in_progress') {
            query.completed = false;
        }
        
        const enrollments = await Enrollment.find(query)
            .populate('courseId')
            .sort({ enrollmentDate: -1 });
            
        // Calcular progreso para cada curso
        const coursesWithProgress = enrollments.map(enrollment => {
            const course = enrollment.courseId;
            const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
            const completedLessons = enrollment.progress.completedLessons.length;
            const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            
            return {
                enrollment: enrollment,
                course: course,
                progress: {
                    totalLessons,
                    completedLessons,
                    progressPercentage,
                    currentModule: enrollment.progress.currentModule,
                    currentLesson: enrollment.progress.currentLesson
                }
            };
        });
        
        res.json({ success: true, courses: coursesWithProgress });
    } catch (error) {
        console.error('Error getting user courses:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// GENERAR CERTIFICADO
app.get('/api/certificate/:certificateId', async (req, res) => {
    try {
        const { certificateId } = req.params;
        
        const enrollment = await Enrollment.findOne({ certificateId })
            .populate('userId', 'mName email')
            .populate('courseId', 'title instructor category duration');
            
        if (!enrollment || !enrollment.completed) {
            return res.json({ success: false, message: 'Certificado no encontrado' });
        }
        
        const certificateData = {
            id: certificateId,
            studentName: enrollment.userId.mName,
            courseName: enrollment.courseId.title,
            instructor: enrollment.courseId.instructor,
            completionDate: enrollment.completionDate,
            finalScore: enrollment.finalQuizScore,
            category: enrollment.courseId.category,
            duration: enrollment.courseId.duration
        };
        
        res.json({ success: true, certificate: certificateData });
    } catch (error) {
        console.error('Error getting certificate:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// ===============================
// SISTEMA DE COMUNIDAD Y DISPARADOR DE IDEAS
// ===============================

// INICIALIZAR PROMPTS DE IDEAS
app.post('/api/ideas/initialize', async (req, res) => {
    try {
        const defaultPrompts = [
            {
                category: "IA para Profesionales",
                prompts: [
                    "¿Cómo puede la IA ayudar a abogados en la revisión de contratos?",
                    "Automatización de diagnósticos médicos con machine learning",
                    "IA para optimizar estrategias de marketing digital",
                    "Chatbots inteligentes para atención al cliente",
                    "Análisis predictivo para decisiones financieras"
                ]
            },
            {
                category: "Desarrollo Web",
                prompts: [
                    "Crear una aplicación React con autenticación JWT",
                    "API REST con Node.js y MongoDB",
                    "Progressive Web Apps (PWA) desde cero",
                    "Microservicios con Docker y Kubernetes",
                    "E-commerce completo con Next.js y Stripe"
                ]
            },
            {
                category: "Data Science",
                prompts: [
                    "Análisis de datos de ventas para predecir tendencias",
                    "Procesamiento de lenguaje natural para análisis de sentimientos",
                    "Visualización interactiva de datos con D3.js",
                    "Machine Learning para recomendaciones personalizadas",
                    "Big Data con Apache Spark y Python"
                ]
            },
            {
                category: "Diseño UX/UI",
                prompts: [
                    "Diseño de interfaces móviles con principios de Material Design",
                    "Prototipado rápido con Figma y herramientas de diseño",
                    "Investigación de usuarios y testing de usabilidad",
                    "Sistema de diseño escalable para productos digitales",
                    "Accesibilidad web y diseño inclusivo"
                ]
            },
            {
                category: "Marketing Digital",
                prompts: [
                    "Estrategias de SEO para e-commerce en 2024",
                    "Campañas de email marketing automatizadas",
                    "Growth hacking para startups tecnológicas",
                    "Análisis de métricas y KPIs en redes sociales",
                    "Publicidad programática y retargeting efectivo"
                ]
            },
            {
                category: "Emprendimiento",
                prompts: [
                    "Validación de ideas de negocio con MVP",
                    "Estrategias de financiamiento para startups",
                    "Construcción de equipos remotos efectivos",
                    "Escalamiento de productos SaaS",
                    "Pitch deck que convence a inversores"
                ]
            }
        ];

        for (const promptData of defaultPrompts) {
            await IdeaPrompt.findOneAndUpdate(
                { category: promptData.category },
                promptData,
                { upsert: true, new: true }
            );
        }

        res.json({ success: true, message: 'Prompts de ideas inicializados correctamente' });
    } catch (error) {
        console.error('Error initializing idea prompts:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER PROMPTS DE IDEAS POR CATEGORÍA
app.get('/api/ideas/prompts/:category?', async (req, res) => {
    try {
        const { category } = req.params;
        
        let query = { active: true };
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const prompts = await IdeaPrompt.find(query);
        res.json({ success: true, prompts });
    } catch (error) {
        console.error('Error getting idea prompts:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// CHAT DE IDEAS - NUEVA SESIÓN
app.post('/api/ideas/chat/new', async (req, res) => {
    try {
        const { userId } = req.body;
        
        const sessionId = `session_${userId}_${Date.now()}`;
        
        const newChat = new IdeaChat({
            userId,
            sessionId,
            messages: [{
                role: 'assistant',
                content: '¡Hola! 👋 Soy tu asistente de ideas. Estoy aquí para ayudarte a descubrir cursos increíbles y generar ideas para tu aprendizaje. ¿En qué área te gustaría explorar hoy? Puedo sugerirte desde IA para profesionales hasta desarrollo web, diseño UX/UI, marketing digital y mucho más.',
                timestamp: new Date()
            }],
            generatedIdeas: []
        });
        
        await newChat.save();
        
        res.json({ success: true, sessionId, chat: newChat });
    } catch (error) {
        console.error('Error creating new chat:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// CHAT DE IDEAS - ENVIAR MENSAJE
app.post('/api/ideas/chat/message', async (req, res) => {
    try {
        const { sessionId, message, userId } = req.body;
        
        const chat = await IdeaChat.findOne({ sessionId, userId });
        if (!chat) {
            return res.json({ success: false, message: 'Sesión de chat no encontrada' });
        }
        
        // Agregar mensaje del usuario
        chat.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });
        
        // Generar respuesta inteligente basada en el contexto
        const response = await generateIdeaResponse(message, chat.messages, userId);
        
        // Agregar respuesta del asistente
        chat.messages.push({
            role: 'assistant',
            content: response.content,
            timestamp: new Date(),
            ideaGenerated: response.ideaGenerated,
            courseRecommendations: response.courseRecommendations
        });
        
        // Actualizar ideas generadas y tema actual
        if (response.ideaGenerated) {
            chat.generatedIdeas.push(response.ideaGenerated);
        }
        if (response.currentTopic) {
            chat.currentTopic = response.currentTopic;
        }
        
        chat.lastActivity = new Date();
        await chat.save();
        
        res.json({ success: true, response: response.content, chat });
    } catch (error) {
        console.error('Error sending chat message:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER HISTORIAL DE CHAT
app.get('/api/ideas/chat/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userId } = req.query;
        
        const chat = await IdeaChat.findOne({ sessionId, userId })
            .populate('messages.courseRecommendations', 'title description thumbnail category level pricing stats');
            
        if (!chat) {
            return res.json({ success: false, message: 'Chat no encontrado' });
        }
        
        res.json({ success: true, chat });
    } catch (error) {
        console.error('Error getting chat:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER CHATS DEL USUARIO
app.get('/api/ideas/chats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const chats = await IdeaChat.find({ userId })
            .sort({ lastActivity: -1 })
            .limit(10)
            .select('sessionId currentTopic generatedIdeas lastActivity messages');
            
        // Solo incluir el último mensaje de cada chat para el preview
        const chatsWithPreview = chats.map(chat => ({
            ...chat.toObject(),
            lastMessage: chat.messages[chat.messages.length - 1],
            messageCount: chat.messages.length
        }));
        
        res.json({ success: true, chats: chatsWithPreview });
    } catch (error) {
        console.error('Error getting user chats:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// FUNCIÓN AUXILIAR PARA GENERAR RESPUESTAS INTELIGENTES
const generateIdeaResponse = async (userMessage, chatHistory, userId) => {
    try {
        // Obtener prompts disponibles
        const allPrompts = await IdeaPrompt.find({ active: true });
        const flatPrompts = allPrompts.reduce((acc, category) => {
            return acc.concat(category.prompts.map(prompt => ({
                prompt,
                category: category.category
            })));
        }, []);
        
        // Obtener cursos relacionados
        const courses = await JsonCourse.find({ 
            active: true,
            visibility: 'public'
        }).limit(5);
        
        // Lógica simple de respuesta basada en palabras clave
        const message = userMessage.toLowerCase();
        let response = '';
        let ideaGenerated = null;
        let courseRecommendations = [];
        let currentTopic = null;
        
        // Detectar categorías mencionadas
        if (message.includes('ia') || message.includes('inteligencia artificial') || message.includes('machine learning')) {
            currentTopic = 'IA para Profesionales';
            const iaPrompts = flatPrompts.filter(p => p.category === 'IA para Profesionales');
            const randomPrompt = iaPrompts[Math.floor(Math.random() * iaPrompts.length)];
            
            response = `¡Excelente elección! La IA está revolucionando todos los sectores. Aquí tienes una idea específica: "${randomPrompt.prompt}". 
            
            Esto podría convertirse en un curso completo donde aprenderías:
            • Conceptos fundamentales de IA y ML
            • Implementación práctica con Python
            • Casos de uso reales en tu industria
            • Herramientas y frameworks modernos
            
            ¿Te gustaría que profundice en algún aspecto específico o prefieres explorar otra área?`;
            
            ideaGenerated = randomPrompt.prompt;
            courseRecommendations = courses.filter(c => 
                c.category?.toLowerCase().includes('ia') || 
                c.title.toLowerCase().includes('ia') ||
                c.title.toLowerCase().includes('machine learning')
            ).slice(0, 3).map(c => c._id);
            
        } else if (message.includes('web') || message.includes('desarrollo') || message.includes('react') || message.includes('javascript')) {
            currentTopic = 'Desarrollo Web';
            const webPrompts = flatPrompts.filter(p => p.category === 'Desarrollo Web');
            const randomPrompt = webPrompts[Math.floor(Math.random() * webPrompts.length)];
            
            response = `¡Perfecto para el desarrollo web! Te propongo esta idea: "${randomPrompt.prompt}". 
            
            Este proyecto te permitiría aprender:
            • Frontend moderno con React/Vue/Angular
            • Backend robusto con Node.js o Python
            • Bases de datos y APIs REST
            • Deployment y DevOps básico
            
            ¿Hay alguna tecnología específica que te interese más?`;
            
            ideaGenerated = randomPrompt.prompt;
            courseRecommendations = courses.filter(c => 
                c.category?.toLowerCase().includes('web') || 
                c.title.toLowerCase().includes('react') ||
                c.title.toLowerCase().includes('javascript')
            ).slice(0, 3).map(c => c._id);
            
        } else if (message.includes('diseño') || message.includes('ux') || message.includes('ui')) {
            currentTopic = 'Diseño UX/UI';
            const designPrompts = flatPrompts.filter(p => p.category === 'Diseño UX/UI');
            const randomPrompt = designPrompts[Math.floor(Math.random() * designPrompts.length)];
            
            response = `¡El diseño UX/UI es fascinante! Aquí tienes una idea: "${randomPrompt.prompt}". 
            
            Podrías crear un curso que incluya:
            • Principios de diseño centrado en el usuario
            • Herramientas como Figma, Sketch, Adobe XD
            • Prototipado y testing de usabilidad
            • Casos prácticos y portfolio
            
            ¿Te interesa más el aspecto visual (UI) o la experiencia del usuario (UX)?`;
            
            ideaGenerated = randomPrompt.prompt;
            
        } else if (message.includes('marketing') || message.includes('seo') || message.includes('social')) {
            currentTopic = 'Marketing Digital';
            const marketingPrompts = flatPrompts.filter(p => p.category === 'Marketing Digital');
            const randomPrompt = marketingPrompts[Math.floor(Math.random() * marketingPrompts.length)];
            
            response = `¡El marketing digital es clave hoy en día! Te sugiero: "${randomPrompt.prompt}". 
            
            Un curso sobre esto podría cubrir:
            • Estrategias de contenido y SEO
            • Publicidad en redes sociales
            • Email marketing y automatización
            • Analytics y métricas de conversión
            
            ¿Hay algún canal de marketing que te interese más?`;
            
            ideaGenerated = randomPrompt.prompt;
            
        } else if (message.includes('emprendimiento') || message.includes('startup') || message.includes('negocio')) {
            currentTopic = 'Emprendimiento';
            const entrepreneurshipPrompts = flatPrompts.filter(p => p.category === 'Emprendimiento');
            const randomPrompt = entrepreneurshipPrompts[Math.floor(Math.random() * entrepreneurshipPrompts.length)];
            
            response = `¡Emprender es emocionante! Aquí tienes una idea: "${randomPrompt.prompt}". 
            
            Este tema podría desarrollarse en:
            • Validación de ideas de negocio
            • Modelos de monetización
            • Estrategias de crecimiento
            • Casos de éxito y fracasos
            
            ¿Tienes alguna idea de negocio en mente o prefieres explorar metodologías?`;
            
            ideaGenerated = randomPrompt.prompt;
            
        } else if (message.includes('data') || message.includes('datos') || message.includes('analytics')) {
            currentTopic = 'Data Science';
            const dataPrompts = flatPrompts.filter(p => p.category === 'Data Science');
            const randomPrompt = dataPrompts[Math.floor(Math.random() * dataPrompts.length)];
            
            response = `¡Los datos son el nuevo petróleo! Te propongo: "${randomPrompt.prompt}". 
            
            Podrías estructurar un curso con:
            • Python/R para análisis de datos
            • Visualización con matplotlib, seaborn, plotly
            • Machine Learning aplicado
            • Proyectos con datasets reales
            
            ¿Te interesa más el análisis descriptivo o el machine learning predictivo?`;
            
            ideaGenerated = randomPrompt.prompt;
            
        } else {
            // Respuesta general con sugerencias de categorías
            response = `Entiendo que buscas inspiración para aprender algo nuevo. Te puedo ayudar en estas áreas populares:

            🤖 **IA para Profesionales** - Automatización, chatbots, análisis predictivo
            💻 **Desarrollo Web** - React, Node.js, aplicaciones completas
            🎨 **Diseño UX/UI** - Interfaces, experiencia de usuario, prototipado
            📊 **Data Science** - Análisis de datos, visualización, machine learning
            📈 **Marketing Digital** - SEO, redes sociales, growth hacking
            🚀 **Emprendimiento** - Startups, validación de ideas, escalamiento
            
            ¿Cuál de estas áreas te llama más la atención? O cuéntame sobre tus intereses específicos.`;
        }
        
        return {
            content: response,
            ideaGenerated,
            courseRecommendations,
            currentTopic
        };
    } catch (error) {
        console.error('Error generating idea response:', error);
        return {
            content: 'Lo siento, tuve un problema generando la respuesta. ¿Podrías intentar de nuevo?',
            ideaGenerated: null,
            courseRecommendations: [],
            currentTopic: null
        };
    }
};

// ===============================
// SISTEMA DE REVIEWS Y PUNTUACIONES
// ===============================

// CREAR REVIEW DE CURSO
app.post('/api/reviews/create', async (req, res) => {
    try {
        const { courseId, userId, rating, review } = req.body;
        
        // Verificar si ya existe una review del usuario para este curso
        const existingReview = await CourseReview.findOne({ courseId, userId });
        if (existingReview) {
            return res.json({ success: false, message: 'Ya has reseñado este curso' });
        }
        
        // Verificar si completó el curso para marcar como verificado
        const enrollment = await Enrollment.findOne({ courseId, userId, completed: true });
        const verified = !!enrollment;
        
        const newReview = new CourseReview({
            courseId,
            userId,
            rating,
            review,
            verified
        });
        
        await newReview.save();
        
        // Actualizar estadísticas del curso
        await updateCourseStats(courseId);
        
        // Notificar al creador del curso
        const course = await JsonCourse.findById(courseId);
        if (course.creatorId && course.creatorId.toString() !== userId) {
            const notification = new CommunityNotification({
                userId: course.creatorId,
                type: 'course_reviewed',
                fromUserId: userId,
                courseId,
                message: `Tu curso "${course.title}" recibió una nueva reseña con ${rating} estrellas`
            });
            await notification.save();
        }
        
        res.json({ success: true, message: 'Reseña creada exitosamente', review: newReview });
    } catch (error) {
        console.error('Error creating review:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER REVIEWS DE UN CURSO
app.get('/api/reviews/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;
        
        const reviews = await CourseReview.find({ courseId })
            .populate('userId', 'mName avatar')
            .sort({ [sortBy]: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const totalReviews = await CourseReview.countDocuments({ courseId });
        
        res.json({ 
            success: true, 
            reviews,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews
            }
        });
    } catch (error) {
        console.error('Error getting course reviews:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// MARCAR REVIEW COMO ÚTIL
app.post('/api/reviews/helpful', async (req, res) => {
    try {
        const { reviewId, userId } = req.body;
        
        const review = await CourseReview.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: 'Reseña no encontrada' });
        }
        
        // Verificar si ya votó
        const alreadyVoted = review.helpfulVotes.includes(userId);
        
        if (alreadyVoted) {
            // Quitar voto
            review.helpfulVotes = review.helpfulVotes.filter(id => id.toString() !== userId);
            review.helpful -= 1;
        } else {
            // Agregar voto
            review.helpfulVotes.push(userId);
            review.helpful += 1;
        }
        
        await review.save();
        
        res.json({ 
            success: true, 
            helpful: review.helpful,
            userVoted: !alreadyVoted
        });
    } catch (error) {
        console.error('Error marking review as helpful:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// FUNCIÓN AUXILIAR PARA ACTUALIZAR ESTADÍSTICAS DEL CURSO
const updateCourseStats = async (courseId) => {
    try {
        const reviews = await CourseReview.find({ courseId });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
            : 0;
            
        await JsonCourse.findByIdAndUpdate(courseId, {
            'stats.totalReviews': totalReviews,
            'stats.averageRating': Math.round(averageRating * 10) / 10 // Redondear a 1 decimal
        });
    } catch (error) {
        console.error('Error updating course stats:', error);
    }
};

// ===============================
// SISTEMA DE SEGUIMIENTO DE CREADORES
// ===============================

// SEGUIR A UN CREADOR
app.post('/api/follow', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;
        
        if (followerId === followingId) {
            return res.json({ success: false, message: 'No puedes seguirte a ti mismo' });
        }
        
        // Verificar si ya sigue al usuario
        const existingFollow = await Follow.findOne({ followerId, followingId });
        if (existingFollow) {
            return res.json({ success: false, message: 'Ya sigues a este usuario' });
        }
        
        const newFollow = new Follow({ followerId, followingId });
        await newFollow.save();
        
        // Notificar al usuario seguido
        const notification = new CommunityNotification({
            userId: followingId,
            type: 'new_follower',
            fromUserId: followerId,
            message: 'Tienes un nuevo seguidor'
        });
        await notification.save();
        
        res.json({ success: true, message: 'Ahora sigues a este usuario' });
    } catch (error) {
        console.error('Error following user:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// DEJAR DE SEGUIR A UN CREADOR
app.post('/api/unfollow', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;
        
        const follow = await Follow.findOneAndDelete({ followerId, followingId });
        
        if (!follow) {
            return res.json({ success: false, message: 'No sigues a este usuario' });
        }
        
        res.json({ success: true, message: 'Has dejado de seguir a este usuario' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER SEGUIDORES DE UN USUARIO
app.get('/api/followers/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const followers = await Follow.find({ followingId: userId })
            .populate('followerId', 'mName email avatar bio totalCoursesCompleted xp level')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, followers: followers.map(f => f.followerId) });
    } catch (error) {
        console.error('Error getting followers:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER USUARIOS QUE SIGUE
app.get('/api/following/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const following = await Follow.find({ followerId: userId })
            .populate('followingId', 'mName email avatar bio totalCoursesCompleted xp level')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, following: following.map(f => f.followingId) });
    } catch (error) {
        console.error('Error getting following:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// VERIFICAR SI SIGUE A UN USUARIO
app.get('/api/follow/status/:followerId/:followingId', async (req, res) => {
    try {
        const { followerId, followingId } = req.params;
        
        const follow = await Follow.findOne({ followerId, followingId });
        
        res.json({ success: true, isFollowing: !!follow });
    } catch (error) {
        console.error('Error checking follow status:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// ===============================
// CURSOS PÚBLICOS Y PRIVADOS
// ===============================

// OBTENER CURSOS PÚBLICOS (MARKETPLACE)
app.get('/api/courses/public', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            category, 
            level, 
            sortBy = 'date',
            search,
            featured = false
        } = req.query;
        
        let query = { 
            active: true, 
            visibility: 'public'
        };
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (level && level !== 'all') {
            query.level = level;
        }
        
        if (featured === 'true') {
            query.featured = true;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        let sortOptions = {};
        switch (sortBy) {
            case 'rating':
                sortOptions = { 'stats.averageRating': -1 };
                break;
            case 'popular':
                sortOptions = { 'stats.enrollments': -1 };
                break;
            case 'newest':
                sortOptions = { date: -1 };
                break;
            default:
                sortOptions = { date: -1 };
        }
        
        const courses = await JsonCourse.find(query)
            .populate('creatorId', 'mName avatar')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const totalCourses = await JsonCourse.countDocuments(query);
        
        res.json({ 
            success: true, 
            courses,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCourses / limit),
                totalCourses
            }
        });
    } catch (error) {
        console.error('Error getting public courses:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// OBTENER CURSOS DE UN CREADOR
app.get('/api/courses/creator/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;
        const { includePrivate = false } = req.query;
        
        let query = { 
            creatorId,
            active: true
        };
        
        if (!includePrivate) {
            query.visibility = 'public';
        }
        
        const courses = await JsonCourse.find(query)
            .populate('creatorId', 'mName avatar bio')
            .sort({ date: -1 });
            
        res.json({ success: true, courses });
    } catch (error) {
        console.error('Error getting creator courses:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// ACTUALIZAR VISIBILIDAD Y PRECIO DE CURSO
app.post('/api/courses/update-pricing', async (req, res) => {
    try {
        const { courseId, userId, visibility, pricing } = req.body;
        
        const course = await JsonCourse.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Curso no encontrado' });
        }
        
        // Verificar que el usuario es el creador
        if (course.user !== userId && course.creatorId?.toString() !== userId) {
            return res.json({ success: false, message: 'No tienes permisos para editar este curso' });
        }
        
        course.visibility = visibility;
        course.pricing = pricing;
        course.lastUpdated = new Date();
        
        await course.save();
        
        res.json({ success: true, message: 'Curso actualizado exitosamente', course });
    } catch (error) {
        console.error('Error updating course pricing:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// ===============================
// NOTIFICACIONES DE COMUNIDAD
// ===============================

// OBTENER NOTIFICACIONES DEL USUARIO
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        
        let query = { userId };
        if (unreadOnly === 'true') {
            query.read = false;
        }
        
        const notifications = await CommunityNotification.find(query)
            .populate('fromUserId', 'mName avatar')
            .populate('courseId', 'title thumbnail')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const unreadCount = await CommunityNotification.countDocuments({ 
            userId, 
            read: false 
        });
        
        res.json({ 
            success: true, 
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// MARCAR NOTIFICACIÓN COMO LEÍDA
app.post('/api/notifications/read', async (req, res) => {
    try {
        const { notificationId, userId } = req.body;
        
        await CommunityNotification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true }
        );
        
        res.json({ success: true, message: 'Notificación marcada como leída' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// MARCAR TODAS LAS NOTIFICACIONES COMO LEÍDAS
app.post('/api/notifications/read-all', async (req, res) => {
    try {
        const { userId } = req.body;
        
        await CommunityNotification.updateMany(
            { userId, read: false },
            { read: true }
        );
        
        res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Cursalo server is running',
        timestamp: new Date().toISOString()
    });
});

// API test endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Cursalo API is working',
        timestamp: new Date().toISOString()
    });
});

// Serve static files from the dist directory (production)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('../dist'));
    
    // Handle React Router (return all requests to React app)
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    });
}

// Export the app for Vercel serverless functions
export function createServer() {
    return app;
}

// Traditional server listen (for local development and other platforms)
if (process.env.NODE_ENV !== 'serverless') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Default export for Vercel
export default app;