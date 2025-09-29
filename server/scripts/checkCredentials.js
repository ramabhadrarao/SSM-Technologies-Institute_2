// server/scripts/checkCredentials.js
require('dotenv').config();
const mongoose = require('mongoose');
const database = require('../config/database');
const User = require('../models/User');

const checkCredentials = async () => {
  try {
    console.log('🔍 Checking seeded user credentials...');
    
    await database.connect();
    
    // Get all users
    const users = await User.find({}).select('email role firstName lastName isActive');
    
    console.log('\n📋 ALL SEEDED USERS:');
    console.log('==========================================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role.toUpperCase()}: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });
    
    console.log('🔑 CORRECT LOGIN CREDENTIALS:');
    console.log('==========================================');
    console.log('ADMIN:');
    console.log('Email: admin@ssmtechnologies.co.in');
    console.log('Password: Admin@123456');
    console.log('');
    
    console.log('INSTRUCTORS:');
    const instructors = users.filter(u => u.role === 'instructor');
    instructors.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Password: Instructor@123`);
      console.log('');
    });
    
    console.log('STUDENTS:');
    const students = users.filter(u => u.role === 'student');
    students.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Password: Student@123`);
      console.log('');
    });
    
    console.log('✅ Credential check completed!');
    
  } catch (error) {
    console.error('❌ Error checking credentials:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

checkCredentials();