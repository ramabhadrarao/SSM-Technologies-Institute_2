// server/scripts/checkInstructorApproval.js
require('dotenv').config();
const mongoose = require('mongoose');
const database = require('../config/database');
const User = require('../models/User');
const Instructor = require('../models/Instructor');

const checkInstructorApproval = async () => {
  try {
    console.log('🔍 Checking instructor approval status...');
    
    await database.connect();
    
    // Get all instructors with their user data
    const instructors = await Instructor.find({})
      .populate('user', 'firstName lastName email isActive')
      .select('isApproved designation experience');
    
    console.log('\n📋 INSTRUCTOR APPROVAL STATUS:');
    console.log('==========================================');
    
    instructors.forEach((instructor, index) => {
      console.log(`${index + 1}. ${instructor.user.firstName} ${instructor.user.lastName}`);
      console.log(`   Email: ${instructor.user.email}`);
      console.log(`   Active: ${instructor.user.isActive}`);
      console.log(`   Approved: ${instructor.isApproved}`);
      console.log(`   Designation: ${instructor.designation}`);
      console.log(`   Experience: ${instructor.experience} years`);
      console.log('');
    });
    
    const approvedCount = instructors.filter(i => i.isApproved).length;
    const unapprovedCount = instructors.filter(i => !i.isApproved).length;
    
    console.log('📊 SUMMARY:');
    console.log(`Total Instructors: ${instructors.length}`);
    console.log(`Approved: ${approvedCount}`);
    console.log(`Unapproved: ${unapprovedCount}`);
    
    if (unapprovedCount > 0) {
      console.log('\n⚠️ UNAPPROVED INSTRUCTORS FOR TESTING:');
      const unapproved = instructors.filter(i => !i.isApproved);
      unapproved.forEach((instructor, index) => {
        console.log(`${index + 1}. Email: ${instructor.user.email}`);
        console.log(`   Password: Instructor@123`);
      });
    }
    
    console.log('\n✅ Instructor approval check completed!');
    
  } catch (error) {
    console.error('❌ Error checking instructor approval:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

checkInstructorApproval();