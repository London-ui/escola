import React, { useState, useEffect } from 'react';
import { User, Activity, Student, Submission } from '../types';
import { getActivities, getStudents, getSubmissions, logout } from '../storage';
import { Plus, Users, FileText, BarChart3, LogOut, Edit3, Eye, Download } from 'lucide-react';
import CreateActivity from './CreateActivity';
import StudentManagement from './StudentManagement';
import ActivityView from './ActivityView';
import { formatDate, calculateGrade } from '../utils';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create-activity' | 'manage-students' | 'view-activity'>('dashboard');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setActivities(getActivities());
    setStudents(getStudents());
    setSubmissions(getSubmissions());
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setCurrentView('view-activity');
  };

  const getActivityStats = (activityId: string) => {
    const activitySubmissions = submissions.filter(s => s.activityId === activityId);
    const totalStudents = students.length;
    const submitted = activitySubmissions.length;
    const pending = totalStudents - submitted;
    const averageGrade = activitySubmissions.length > 0 
      ? activitySubmissions.reduce((sum, s) => sum + s.grade, 0) / activitySubmissions.length 
      : 0;

    return { submitted, pending, averageGrade };
  };

  if (currentView === 'create-activity') {
    return (
      <CreateActivity 
        user={user} 
        onBack={() => {
          setCurrentView('dashboard');
          loadData();
        }}
      />
    );
  }

  if (currentView === 'manage-students') {
    return (
      <StudentManagement 
        user={user} 
        onBack={() => {
          setCurrentView('dashboard');
          loadData();
        }}
      />
    );
  }

  if (currentView === 'view-activity' && selectedActivity) {
    return (
      <ActivityView 
        activity={selectedActivity}
        user={user}
        onBack={() => {
          setCurrentView('dashboard');
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel do Professor</h1>
              <p className="text-sm text-gray-600">Bem-vindo, {user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Alunos</dt>
                  <dd className="text-2xl font-bold text-gray-900">{students.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Atividades Criadas</dt>
                  <dd className="text-2xl font-bold text-gray-900">{activities.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Entregas</dt>
                  <dd className="text-2xl font-bold text-gray-900">{submissions.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setCurrentView('create-activity')}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Atividade
          </button>
          <button
            onClick={() => setCurrentView('manage-students')}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            Gerenciar Alunos
          </button>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Atividades Criadas</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activities.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade criada ainda</p>
                <button
                  onClick={() => setCurrentView('create-activity')}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Criar primeira atividade
                </button>
              </div>
            ) : (
              activities.map((activity) => {
                const stats = getActivityStats(activity.id);
                return (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span>Criada em {formatDate(activity.createdAt)}</span>
                          <span className="mx-2">•</span>
                          <span>{activity.questions.length} questões</span>
                          <span className="mx-2">•</span>
                          <span>{activity.attachments.length} arquivos</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {stats.submitted}/{students.length} entregas
                          </div>
                          <div className="text-sm text-gray-500">
                            Média: {stats.averageGrade.toFixed(1)}%
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewActivity(activity)}
                          className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;