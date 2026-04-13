import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import SkillDevelopmentPage from "./pages/SkillDevelopmentPage";
import CollaborationPage from "./pages/CollaborationPage";
import GamificationPage from "./pages/GamificationPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CalendarPage from "./pages/CalendarPage";
import CalendarViewPage from "./pages/CalendarViewPage";
import PriorityMatrixPage from "./pages/PriorityMatrixPage";
import SmartRemindersPage from "./pages/SmartRemindersPage";
import RecurringTasksPage from "./pages/RecurringTasksPage";
import TeamTasksPage from "./pages/TeamTasksPage";
import AdvancedDashboardPage from "./pages/AdvancedDashboardPage";
import DragDropPage from "./pages/DragDropPage";
import SmartAutomationPage from "./pages/SmartAutomationPage";
import GoogleCalendarPage from "./pages/GoogleCalendarPage";
import EmailIntegrationPage from "./pages/EmailIntegrationPage";
import SlackDiscordPage from "./pages/SlackDiscordPage";
import AIInterviewPage from "./pages/AIInterviewPage";
import ThemeSettingsPage from "./pages/ThemeSettingsPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import FaceLoginPage from "./pages/FaceLoginPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AIAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skill-development"
            element={
              <ProtectedRoute>
                <SkillDevelopmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collaboration"
            element={
              <ProtectedRoute>
                <CollaborationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification"
            element={
              <ProtectedRoute>
                <GamificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/priority-matrix"
            element={
              <ProtectedRoute>
                <PriorityMatrixPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/smart-reminders"
            element={
              <ProtectedRoute>
                <SmartRemindersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recurring-tasks"
            element={
              <ProtectedRoute>
                <RecurringTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-tasks"
            element={
              <ProtectedRoute>
                <TeamTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advanced-dashboard"
            element={
              <ProtectedRoute>
                <AdvancedDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar-view"
            element={
              <ProtectedRoute>
                <CalendarViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/face-login"
            element={
              <ProtectedRoute>
                <FaceLoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drag-drop"
            element={
              <ProtectedRoute>
                <DragDropPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/smart-automation"
            element={
              <ProtectedRoute>
                <SmartAutomationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/google-calendar"
            element={
              <ProtectedRoute>
                <GoogleCalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-integration"
            element={
              <ProtectedRoute>
                <EmailIntegrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/slack-discord"
            element={
              <ProtectedRoute>
                <SlackDiscordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-interview"
            element={
              <ProtectedRoute>
                <AIInterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/theme-settings"
            element={
              <ProtectedRoute>
                <ThemeSettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
