import React, { useState, useEffect } from 'react';
import { Activity, User, Submission, StudentAnswer, FileAttachment, Draft } from '../types';
import { getSubmissions, saveSubmission, getDrafts, saveDraft } from '../storage';
import { ArrowLeft, Upload, FileText, Save, Send, CheckCircle, XCircle } from 'lucide-react';
import { fileToBase64, validateFileSize, formatFileSize, downloadFile, calculateGrade } from '../utils';

interface ActivityStudentProps {
  activity: Activity;
  user: User;
  onBack: () => void;
}

const ActivityStudent: React.FC<ActivityStudentProps> = ({ activity, user, onBack }) => {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    checkSubmission();
    loadDrafts();
  }, []);

  const checkSubmission = () => {
    const submissions = getSubmissions();
    const existingSubmission = submissions.find(s => s.activityId === activity.id && s.studentId === user.id);
    if (existingSubmission) {
      setSubmission(existingSubmission);
      setSubmitted(true);
    }
  };

  const loadDrafts = () => {
    const allDrafts = getDrafts();
    const activityDrafts = allDrafts.filter(d => d.activityId === activity.id && d.studentId === user.id);
    const draftMap: Record<string, string> = {};
    activityDrafts.forEach(draft => {
      draftMap[draft.questionId] = draft.content;
    });
    setDrafts(draftMap);
  };

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleDraftSave = (questionId: string, content: string) => {
    const draft: Draft = {
      activityId: activity.id,
      studentId: user.id,
      questionId,
      content,
      savedAt: new Date().toISOString()
    };
    saveDraft(draft);
    setDrafts(prev => ({ ...prev, [questionId]: content }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validateFileSize(file)) {
        alert(`Arquivo ${file.name} é muito grande. Máximo 80MB permitido.`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const fileAttachment: FileAttachment = {
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.id
        };
        setAttachments(prev => [...prev, fileAttachment]);
      } catch (error) {
        alert(`Erro ao processar arquivo ${file.name}`);
      }
    }
  };

  const handleSubmit = async () => {
    // Validate answers
    const unanswered = activity.questions.filter(q => !answers[q.id] && answers[q.id] !== 0);
    if (unanswered.length > 0) {
      alert(`Por favor, responda todas as questões. Faltam ${unanswered.length} questões.`);
      return;
    }

    setLoading(true);

    try {
      // Calculate scores
      const studentAnswers: StudentAnswer[] = activity.questions.map(question => {
        const userAnswer = answers[question.id];
        let isCorrect = false;
        let points = 0;

        if (question.type === 'multiple-choice') {
          isCorrect = userAnswer === question.correctAnswer;
          points = isCorrect ? question.points : 0;
        } else {
          // For essay questions, give full points (teacher will grade manually)
          points = question.points;
        }

        return {
          questionId: question.id,
          answer: userAnswer,
          isCorrect,
          points
        };
      });

      const totalPoints = studentAnswers.reduce((sum, ans) => sum + ans.points, 0);
      const maxPoints = activity.questions.reduce((sum, q) => sum + q.points, 0);
      const grade = calculateGrade(totalPoints, maxPoints);

      const newSubmission: Submission = {
        id: Date.now().toString(),
        activityId: activity.id,
        studentId: user.id,
        answers: studentAnswers,
        attachments,
        submittedAt: new Date().toISOString(),
        totalPoints,
        maxPoints,
        grade
      };

      saveSubmission(newSubmission);
      setSubmission(newSubmission);
      setSubmitted(true);
    } catch (error) {
      alert('Erro ao enviar atividade');
    } finally {
      setLoading(false);
    }
  };

  if (submitted && submission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Result Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Atividade Concluída!</h2>
              <div className="text-3xl font-bold text-blue-600 mb-2">{submission.grade}%</div>
              <p className="text-gray-600">
                Você obteve {submission.totalPoints} de {submission.maxPoints} pontos
              </p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resultados por Questão</h3>
            <div className="space-y-6">
              {activity.questions.map((question, index) => {
                const answer = submission.answers.find(a => a.questionId === question.id);
                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Questão {index + 1} ({question.points} pontos)
                      </h4>
                      <div className="flex items-center">
                        {answer?.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : question.type === 'multiple-choice' ? (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        ) : (
                          <div className="h-5 w-5 bg-yellow-500 rounded-full mr-2" />
                        )}
                        <span className="text-sm font-medium">
                          {answer?.points}/{question.points} pontos
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{question.question}</p>
                    
                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-100 border-green-300'
                                : optionIndex === answer?.answer
                                ? 'bg-red-100 border-red-300'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-2">
                                {String.fromCharCode(65 + optionIndex)})
                              </span>
                              <span className="text-sm">{option}</span>
                              {optionIndex === question.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                              )}
                              {optionIndex === answer?.answer && optionIndex !== question.correctAnswer && (
                                <XCircle className="h-4 w-4 text-red-500 ml-2" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'essay' && (
                      <div className="mt-3">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-700">{answer?.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Activity Description */}
        {activity.description && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Descrição</h3>
            <p className="text-gray-700">{activity.description}</p>
          </div>
        )}

        {/* Activity Files */}
        {activity.attachments.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Arquivos da Atividade</h3>
            <div className="space-y-2">
              {activity.attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(file.data, file.name)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Baixar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Questões</h3>
          <div className="space-y-8">
            {activity.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Questão {index + 1} ({question.points} pontos)
                  </h4>
                  <span className="text-sm text-gray-500">
                    {question.type === 'multiple-choice' ? 'Múltipla Escolha' : 'Dissertativa'}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{question.question}</p>
                
                {question.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    {question.options?.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optionIndex}
                          checked={answers[question.id] === optionIndex}
                          onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-900">
                          {String.fromCharCode(65 + optionIndex)}) {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                
                {question.type === 'essay' && (
                  <div>
                    <textarea
                      value={answers[question.id] || drafts[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite sua resposta aqui..."
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleDraftSave(question.id, answers[question.id] as string || '')}
                        className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Salvar Rascunho
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enviar Arquivos</h3>
          
          <div className="mb-4">
            <label className="block">
              <span className="sr-only">Escolher arquivos</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </label>
            <p className="text-sm text-gray-500 mt-1">Máximo 80MB por arquivo</p>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Enviar Atividade
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityStudent;