import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentCoursePlanner from "./pages/StudentCoursePlanner";
import StudentCourses from "./pages/StudentCourses";
import CoursesCatalog from "./pages/CoursesCatalog";
import StudentRegistration from "./pages/StudentRegistration";
import StudentProfile from "./pages/StudentProfile";
import StudentScheduleSubmit from "./pages/StudentScheduleSubmit";
import StudentGraduationCheck from "./pages/StudentGraduationCheck";
import TeacherStudentList from "./pages/TeacherStudentList";
import TeacherCourses from "./pages/TeacherCourses";
import TeacherProfile from "./pages/TeacherProfile";
import TeacherMakeupClass from "./pages/TeacherMakeupClass";
import AdminUsers from "./pages/AdminUsers";
import AdminImportData from "./pages/AdminImportData";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminCurriculum from "./pages/AdminCurriculum";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import BuilderPage from "./components/BuilderPage";
import "./builder-config";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student Routes */}
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/course-planner/student" element={<StudentCoursePlanner />} />
          <Route path="/courses/student" element={<StudentCourses />} />
          <Route path="/catalog/student" element={<CoursesCatalog />} />
          <Route path="/registration/student" element={<StudentRegistration />} />
          <Route path="/profile/student" element={<StudentProfile />} />
          <Route path="/schedule-submit/student" element={<StudentScheduleSubmit />} />
          <Route path="/graduation-check/student" element={<StudentGraduationCheck />} />

          {/* Teacher Routes */}
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/courses/teacher" element={<TeacherCourses />} />
          <Route path="/students/teacher" element={<TeacherStudentList />} />
          <Route path="/profile/teacher" element={<TeacherProfile />} />
          <Route path="/makeup-class/teacher" element={<TeacherMakeupClass />} />

          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/users/admin" element={<AdminUsers />} />
          <Route path="/import/admin" element={<AdminImportData />} />
          <Route path="/announcements/admin" element={<AdminAnnouncements />} />
          <Route path="/curriculum/admin" element={<AdminCurriculum />} />
          <Route path="/profile/admin" element={<AdminDashboard />} />

          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
