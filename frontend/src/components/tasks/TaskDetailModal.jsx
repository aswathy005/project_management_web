import { useState, useEffect, useCallback } from 'react';
import { Calendar, FolderKanban, MessageSquare, Send, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { taskService } from '../../services/taskService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatRelativeTime, isOverdue } from '../../utils/formatters';

export default function TaskDetailModal({ taskId, isOpen, onClose, onTaskUpdated }) {
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadTask = useCallback(async () => {
    if (!taskId || !isOpen) return;
    setLoading(true);
    try {
      const data = await taskService.getById(taskId);
      setTask(data.task);
      setComments(data.comments || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load task details'));
    } finally {
      setLoading(false);
    }
  }, [taskId, isOpen]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleStatusChange = async (nextStatus) => {
    if (!task || task.status === nextStatus) return;
    setUpdatingStatus(true);
    try {
      const data = await taskService.updateStatus(task._id, nextStatus);
      setTask(data.task);
      toast.success(`Status updated to ${nextStatus}`);
      if (onTaskUpdated) onTaskUpdated(data.task);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !task) return;
    setSubmittingComment(true);
    try {
      const data = await taskService.addComment(task._id, commentText.trim());
      setComments((prev) => [...prev, data.comment]);
      setCommentText('');
      toast.success('Comment posted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await taskService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? task.title : 'Task Details'}
      subtitle={task?.project?.name ? `Project: ${task.project.name}` : undefined}
      size="lg"
    >
      {loading || !task ? (
        <LoadingSpinner label="Loading task details..." />
      ) : (
        <div className="space-y-6">
          {/* Status & Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={task.status}>{task.status}</Badge>
              <Badge variant={task.priority}>{task.priority} Priority</Badge>
              {isOverdue(task.dueDate, task.status) && (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                  Overdue
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Change status:</span>
              <select
                value={task.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description
            </h4>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {task.description || 'No description provided for this task.'}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200/80 p-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <FolderKanban className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="text-[11px] font-medium text-slate-400">Project</p>
                <p className="text-xs font-semibold text-slate-800">{task.project?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {task.assignedTo ? (
                <Avatar name={task.assignedTo.name} color={task.assignedTo.avatarColor} size="xs" />
              ) : (
                <User className="h-4 w-4 text-slate-400" />
              )}
              <div>
                <p className="text-[11px] font-medium text-slate-400">Assigned To</p>
                <p className="text-xs font-semibold text-slate-800">
                  {task.assignedTo?.name || 'Unassigned'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[11px] font-medium text-slate-400">Due Date</p>
                <p className="text-xs font-semibold text-slate-800">{formatDate(task.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-slate-100 pt-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-600" />
              <h4 className="text-sm font-semibold text-slate-900">
                Discussion ({comments.length})
              </h4>
            </div>

            <div className="mb-4 max-h-60 space-y-3 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="rounded-xl bg-slate-50 py-6 text-center text-xs text-slate-500">
                  No comments yet. Start the conversation below.
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <Avatar
                      name={comment.author?.name}
                      color={comment.author?.avatarColor}
                      size="xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900">
                            {comment.author?.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        {(user?.role === 'Admin' || comment.author?._id === user?._id) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment._id)}
                            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Delete comment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <Button type="submit" loading={submittingComment} disabled={!commentText.trim()}>
                <Send className="h-4 w-4" />
                Post
              </Button>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}
