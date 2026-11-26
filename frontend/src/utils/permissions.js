export const isAdmin = (user) => user?.role === 'Admin';

export const isManagerOrAdmin = (user) =>
  user?.role === 'Admin' || user?.role === 'Project Manager';

export const canManageProject = (user, project) => {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  if (user.role === 'Project Manager') {
    if (!project) return true;
    const managerId = project.projectManager?._id || project.projectManager;
    const creatorId = project.createdBy?._id || project.createdBy;
    return managerId === user._id || creatorId === user._id;
  }
  return false;
};

export const canDeleteTask = (user, task) => {
  if (!user || !task) return false;
  if (user.role === 'Admin' || user.role === 'Project Manager') return true;
  const creatorId = task.createdBy?._id || task.createdBy;
  return creatorId === user._id;
};
