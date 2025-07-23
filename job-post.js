
// job-post.js - Complete Job Posting System

class JobPostingSystem {
    constructor() {
        this.jobs = JSON.parse(localStorage.getItem('skillsync_jobs')) || [];
        this.currentJobId = null;
        this.skillsArray = [];
        this.preferredSkillsArray = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadJobs();
        this.updateStats();
    }

    bindEvents() {
        // Skills input handling
        const skillInput = document.getElementById('skillInput');
        const preferredSkillInput = document.getElementById('preferredSkillInput');
        
        if (skillInput) {
            skillInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addSkill(skillInput.value.trim(), 'required');
                }
            });
        }

        if (preferredSkillInput) {
            preferredSkillInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addSkill(preferredSkillInput.value.trim(), 'preferred');
                }
            });
        }

        // Modal close on outside click
        document.getElementById('jobModal').addEventListener('click', (e) => {
            if (e.target.id === 'jobModal') {
                this.closeJobModal();
            }
        });

        document.getElementById('jobDetailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'jobDetailsModal') {
                this.closeJobDetailsModal();
            }
        });
    }

    // Generate unique ID
    generateId() {
        return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Add skill to array
    addSkill(skill, type) {
        if (!skill) return;

        const skillsArray = type === 'required' ? this.skillsArray : this.preferredSkillsArray;
        const tagsContainer = type === 'required' ? 'skillsTags' : 'preferredSkillsTags';
        const input = type === 'required' ? 'skillInput' : 'preferredSkillInput';

        if (!skillsArray.includes(skill)) {
            skillsArray.push(skill);
            this.renderSkillTags(type);
            document.getElementById(input).value = '';
        }
    }

    // Remove skill from array
    removeSkill(skill, type) {
        const skillsArray = type === 'required' ? this.skillsArray : this.preferredSkillsArray;
        const index = skillsArray.indexOf(skill);
        
        if (index > -1) {
            skillsArray.splice(index, 1);
            this.renderSkillTags(type);
        }
    }

    // Render skill tags
    renderSkillTags(type) {
        const skillsArray = type === 'required' ? this.skillsArray : this.preferredSkillsArray;
        const container = document.getElementById(type === 'required' ? 'skillsTags' : 'preferredSkillsTags');
        const hiddenInput = document.getElementById(type === 'required' ? 'requiredSkills' : 'preferredSkills');

        container.innerHTML = skillsArray.map(skill => `
            <div class="skill-tag-removable">
                <span>${skill}</span>
                <button type="button" onclick="jobSystem.removeSkill('${skill}', '${type}')">&times;</button>
            </div>
        `).join('');

        hiddenInput.value = skillsArray.join(',');
    }

    // Open job modal
    openJobModal(jobId = null) {
        this.currentJobId = jobId;
        const modal = document.getElementById('jobModal');
        const modalTitle = document.getElementById('modalTitle');
        const saveButtonText = document.getElementById('saveButtonText');

        if (jobId) {
            // Edit mode
            modalTitle.textContent = 'Edit Job Posting';
            saveButtonText.textContent = 'Update Job';
            this.loadJobForEdit(jobId);
        } else {
            // Create mode
            modalTitle.textContent = 'Create New Job Posting';
            saveButtonText.textContent = 'Save Job';
            this.resetForm();
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Close job modal
    closeJobModal() {
        const modal = document.getElementById('jobModal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
        this.resetForm();
    }

    // Reset form
    resetForm() {
        document.getElementById('jobForm').reset();
        this.skillsArray = [];
        this.preferredSkillsArray = [];
        this.renderSkillTags('required');
        this.renderSkillTags('preferred');
        this.currentJobId = null;
    }

    // Load job for editing
    loadJobForEdit(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        // Fill form fields
        document.getElementById('jobTitle').value = job.title || '';
        document.getElementById('jobDepartment').value = job.department || '';
        document.getElementById('jobType').value = job.type || '';
        document.getElementById('jobLocation').value = job.location || '';
        document.getElementById('salaryRange').value = job.salary || '';
        document.getElementById('experience').value = job.experience || '';
        document.getElementById('jobDescription').value = job.description || '';
        document.getElementById('jobRequirements').value = job.requirements || '';
        document.getElementById('jobBenefits').value = job.benefits || '';
        document.getElementById('applicationDeadline').value = job.deadline || '';
        document.getElementById('applicationEmail').value = job.applicationEmail || '';
        document.getElementById('jobStatus').value = job.status || '';
        document.getElementById('urgency').value = job.urgency || '';

        // Load skills
        this.skillsArray = job.skills ? job.skills.split(',').filter(s => s.trim()) : [];
        this.preferredSkillsArray = job.preferredSkills ? job.preferredSkills.split(',').filter(s => s.trim()) : [];
        this.renderSkillTags('required');
        this.renderSkillTags('preferred');
    }

    // Save job
    saveJob() {
        const form = document.getElementById('jobForm');
        const formData = new FormData(form);
        
        // Validate required fields
        const requiredFields = ['jobTitle', 'jobDepartment', 'jobType', 'jobLocation', 'experience', 'jobDescription', 'jobRequirements'];
        let isValid = true;

        for (const field of requiredFields) {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                element.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                element.style.borderColor = '#e9ecef';
            }
        }

        if (!isValid) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (this.skillsArray.length === 0) {
            this.showNotification('Please add at least one required skill', 'error');
            return;
        }

        // Create job object
        const jobData = {
            id: this.currentJobId || this.generateId(),
            title: formData.get('jobTitle'),
            department: formData.get('jobDepartment'),
            type: formData.get('jobType'),
            location: formData.get('jobLocation'),
            salary: formData.get('salaryRange'),
            experience: formData.get('experience'),
            description: formData.get('jobDescription'),
            requirements: formData.get('jobRequirements'),
            benefits: formData.get('jobBenefits'),
            skills: this.skillsArray.join(','),
            preferredSkills: this.preferredSkillsArray.join(','),
            deadline: formData.get('applicationDeadline'),
            applicationEmail: formData.get('applicationEmail'),
            status: formData.get('jobStatus'),
            urgency: formData.get('urgency') || 'Normal',
            postedDate: this.currentJobId ? 
                this.jobs.find(j => j.id === this.currentJobId)?.postedDate : 
                new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            applications: this.currentJobId ? 
                this.jobs.find(j => j.id === this.currentJobId)?.applications || 0 : 
                0,
            views: this.currentJobId ? 
                this.jobs.find(j => j.id === this.currentJobId)?.views || 0 : 
                0
        };

        // Save to jobs array
        if (this.currentJobId) {
            // Update existing job
            const index = this.jobs.findIndex(j => j.id === this.currentJobId);
            if (index !== -1) {
                this.jobs[index] = jobData;
                this.showNotification('Job updated successfully!', 'success');
            }
        } else {
            // Add new job
            this.jobs.push(jobData);
            this.showNotification('Job posted successfully!', 'success');
        }

        // Save to localStorage
        localStorage.setItem('skillsync_jobs', JSON.stringify(this.jobs));

        // Refresh display
        this.loadJobs();
        this.updateStats();
        this.closeJobModal();
    }

    // Load and display jobs
    loadJobs() {
        const jobsGrid = document.getElementById('jobsGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.jobs.length === 0) {
            jobsGrid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        const jobsHTML = this.jobs.map(job => this.createJobCard(job)).join('');
        jobsGrid.innerHTML = jobsHTML;
    }

    // Create job card HTML
    createJobCard(job) {
        const postedDate = new Date(job.postedDate).toLocaleDateString();
        const skillsList = job.skills ? job.skills.split(',').slice(0, 3) : [];
        const statusClass = `status-${job.status.toLowerCase()}`;
        const urgencyBadge = job.urgency !== 'Normal' ? 
            `<span class="urgency-badge urgency-${job.urgency.toLowerCase()}">${job.urgency}</span>` : '';

        return `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-header">
                    <div class="job-info">
                        <h3>${job.title}</h3>
                        <div class="job-meta">
                            <span><i class="fas fa-building"></i> ${job.department}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                            <span><i class="fas fa-clock"></i> ${job.type}</span>
                        </div>
                        <div class="job-meta">
                            <span><i class="fas fa-calendar"></i> Posted ${postedDate}</span>
                            ${job.salary ? `<span><i class="fas fa-rupee-sign"></i> ${job.salary}</span>` : ''}
                        </div>
                    </div>
                    <div class="job-status">
                        <span class="status-badge ${statusClass}">${job.status}</span>
                        ${urgencyBadge}
                    </div>
                </div>
                
                <div class="job-description">
                    ${job.description}
                </div>
                
                ${skillsList.length > 0 ? `
                <div class="job-skills">
                    ${skillsList.map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                    ${job.skills.split(',').length > 3 ? `<span class="skill-tag">+${job.skills.split(',').length - 3} more</span>` : ''}
                </div>
                ` : ''}
                
                <div class="job-actions">
                    <div class="job-stats">
                        <span><i class="fas fa-eye"></i> ${job.views || 0} views</span>
                        <span><i class="fas fa-user-check"></i> ${job.applications || 0} applications</span>
                    </div>
                    <div class="job-buttons">
                        <button class="btn-icon btn-view" onclick="jobSystem.viewJob('${job.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="jobSystem.openJobModal('${job.id}')" title="Edit Job">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-toggle" onclick="jobSystem.toggleJobStatus('${job.id}')" title="Toggle Status">
                            <i class="fas fa-${job.status === 'Active' ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="jobSystem.deleteJob('${job.id}')" title="Delete Job">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // View job details
    viewJob(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        // Increment view count
        job.views = (job.views || 0) + 1;
        localStorage.setItem('skillsync_jobs', JSON.stringify(this.jobs));
        this.loadJobs();

        const modal = document.getElementById('jobDetailsModal');
        const title = document.getElementById('jobDetailsTitle');
        const content = document.getElementById('jobDetailsContent');

        title.textContent = job.title;
        content.innerHTML = this.createJobDetailsHTML(job);

        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Create job details HTML
    createJobDetailsHTML(job) {
        const postedDate = new Date(job.postedDate).toLocaleDateString();
        const updatedDate = new Date(job.updatedDate).toLocaleDateString();
        const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Not specified';

        return `
            <div class="job-details">
                <div class="job-details-header">
                    <div class="job-title-section">
                        <h2>${job.title}</h2>
                        <div class="job-meta-large">
                            <span><i class="fas fa-building"></i> ${job.department}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                            <span><i class="fas fa-clock"></i> ${job.type}</span>
                            <span><i class="fas fa-layer-group"></i> ${job.experience}</span>
                        </div>
                        ${job.salary ? `<div class="salary-info"><i class="fas fa-rupee-sign"></i> ${job.salary}</div>` : ''}
                    </div>
                    <div class="job-status-section">
                        <span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span>
                        ${job.urgency !== 'Normal' ? `<span class="urgency-badge urgency-${job.urgency.toLowerCase()}">${job.urgency}</span>` : ''}
                    </div>
                </div>

                <div class="job-details-grid">
                    <div class="detail-section">
                        <h4><i class="fas fa-info-circle"></i> Job Description</h4>
                        <p>${job.description}</p>
                    </div>

                    <div class="detail-section">
                        <h4><i class="fas fa-list-check"></i> Requirements</h4>
                        <p>${job.requirements}</p>
                    </div>

                    ${job.benefits ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-gift"></i> Benefits & Perks</h4>
                        <p>${job.benefits}</p>
                    </div>
                    ` : ''}

                    <div class="detail-section">
                        <h4><i class="fas fa-code"></i> Required Skills</h4>
                        <div class="skills-list">
                            ${job.skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                        </div>
                    </div>

                    ${job.preferredSkills ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-star"></i> Preferred Skills</h4>
                        <div class="skills-list">
                            ${job.preferredSkills.split(',').map(skill => `<span class="skill-tag-preferred">${skill.trim()}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <div class="detail-section">
                        <h4><i class="fas fa-calendar"></i> Application Information</h4>
                        <div class="application-info">
                            <p><strong>Application Deadline:</strong> ${deadline}</p>
                            ${job.applicationEmail ? `<p><strong>Application Email:</strong> ${job.applicationEmail}</p>` : ''}
                            <p><strong>Posted Date:</strong> ${postedDate}</p>
                            <p><strong>Last Updated:</strong> ${updatedDate}</p>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4><i class="fas fa-chart-bar"></i> Job Statistics</h4>
                        <div class="job-stats-detailed">
                            <div class="stat-box">
                                <span class="stat-number">${job.views || 0}</span>
                                <span class="stat-label">Views</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-number">${job.applications || 0}</span>
                                <span class="stat-label">Applications</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="job-details-actions">
                    <button class="btn-secondary" onclick="jobSystem.closeJobDetailsModal()">Close</button>
                    <button class="btn-primary" onclick="jobSystem.openJobModal('${job.id}')">
                        <i class="fas fa-edit"></i> Edit Job
                    </button>
                </div>
            </div>

            <style>
                .job-details {
                    max-width: 100%;
                }

                .job-details-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f0f0f0;
                }

                .job-title-section h2 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                    color: #333;
                }

                .job-meta-large {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 0.5rem;
                    color: #666;
                    font-size: 0.9rem;
                }

                .salary-info {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #667eea;
                }

                .job-status-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    align-items: flex-end;
                }

                .job-details-grid {
                    display: grid;
                    gap: 1.5rem;
                }

                .detail-section h4 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    color: #333;
                    font-size: 1rem;
                }

                .detail-section h4 i {
                    color: #667eea;
                }

                .detail-section p {
                    color: #666;
                    line-height: 1.6;
                    margin: 0;
                }

                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .skill-tag-preferred {
                    background: rgba(46, 204, 113, 0.1);
                    color: #2ecc71;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .application-info p {
                    margin-bottom: 0.5rem;
                }

                .job-stats-detailed {
                    display: flex;
                    gap: 2rem;
                }

                .stat-box {
                    text-align: center;
                }

                .stat-box .stat-number {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #667eea;
                    line-height: 1;
                }

                .stat-box .stat-label {
                    font-size: 0.85rem;
                    color: #666;
                    margin-top: 0.25rem;
                }

                .job-details-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f0f0f0;
                }

                @media (max-width: 768px) {
                    .job-details-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .job-status-section {
                        align-items: flex-start;
                    }

                    .job-meta-large {
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .job-stats-detailed {
                        justify-content: center;
                    }

                    .job-details-actions {
                        flex-direction: column;
                    }
                }
            </style>
        `;
    }

    // Close job details modal
    closeJobDetailsModal() {
        const modal = document.getElementById('jobDetailsModal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    // Toggle job status
    toggleJobStatus(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        if (job.status === 'Active') {
            job.status = 'Paused';
            this.showNotification('Job paused successfully', 'success');
        } else if (job.status === 'Paused') {
            job.status = 'Active';
            this.showNotification('Job activated successfully', 'success');
        } else {
            job.status = 'Active';
            this.showNotification('Job activated successfully', 'success');
        }

        job.updatedDate = new Date().toISOString();
        localStorage.setItem('skillsync_jobs', JSON.stringify(this.jobs));
        this.loadJobs();
        this.updateStats();
    }

    // Delete job
    deleteJob(jobId) {
        if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            return;
        }

        this.jobs = this.jobs.filter(j => j.id !== jobId);
        localStorage.setItem('skillsync_jobs', JSON.stringify(this.jobs));
        
        this.showNotification('Job deleted successfully', 'success');
        this.loadJobs();
        this.updateStats();
    }

    // Update statistics
    updateStats() {
        const totalJobs = this.jobs.length;
        const activeJobs = this.jobs.filter(j => j.status === 'Active').length;
        const totalApplications = this.jobs.reduce((sum, job) => sum + (job.applications || 0), 0);

        document.getElementById('totalJobs').textContent = totalJobs;
        document.getElementById('activeJobs').textContent = activeJobs;
        document.getElementById('applicationCount').textContent = totalApplications;
    }

    // Filter jobs
    filterJobs() {
        const jobTypeFilter = document.getElementById('jobTypeFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const departmentFilter = document.getElementById('departmentFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        let filteredJobs = this.jobs.filter(job => {
            return (!jobTypeFilter || job.type === jobTypeFilter) &&
                   (!statusFilter || job.status === statusFilter) &&
                   (!departmentFilter || job.department === departmentFilter) &&
                   (!searchFilter || 
                    job.title.toLowerCase().includes(searchFilter) ||
                    job.description.toLowerCase().includes(searchFilter) ||
                    job.skills.toLowerCase().includes(searchFilter));
        });

        const jobsGrid = document.getElementById('jobsGrid');
        const emptyState = document.getElementById('emptyState');

        if (filteredJobs.length === 0) {
            jobsGrid.innerHTML = '';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No Jobs Found</h3>
                <p>No jobs match your current filters. Try adjusting your search criteria.</p>
                <button class="btn-primary" onclick="jobSystem.clearFilters()">
                    <i class="fas fa-times"></i>
                    <span>Clear Filters</span>
                </button>
            `;
        } else {
            emptyState.style.display = 'none';
            const jobsHTML = filteredJobs.map(job => this.createJobCard(job)).join('');
            jobsGrid.innerHTML = jobsHTML;
        }
    }

    // Clear filters
    clearFilters() {
        document.getElementById('jobTypeFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('departmentFilter').value = '';
        document.getElementById('searchFilter').value = '';
        this.loadJobs();
    }

    // Show notification
    showNotification(message, type = 'info') {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            max-width: 350px;
            pointer-events: all;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
            cursor: pointer;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; margin-left: 0.5rem;">×</button>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Global functions for easy access
function toggleFilters() {
    const filtersPanel = document.getElementById('filtersPanel');
    filtersPanel.classList.toggle('active');
    
    if (filtersPanel.classList.contains('active')) {
        filtersPanel.style.display = 'block';
    } else {
        filtersPanel.style.display = 'none';
    }
}

function openJobModal(jobId = null) {
    jobSystem.openJobModal(jobId);
}

function closeJobModal() {
    jobSystem.closeJobModal();
}

function saveJob() {
    jobSystem.saveJob();
}

function filterJobs() {
    jobSystem.filterJobs();
}

function clearFilters() {
    jobSystem.clearFilters();
}

// Initialize job posting system
let jobSystem;

document.addEventListener('DOMContentLoaded', function() {
    jobSystem = new JobPostingSystem();
    
    // Add some demo data if no jobs exist
    if (jobSystem.jobs.length === 0) {
        const demoJobs = [
            {
                id: 'demo_job_1',
                title: 'Senior Frontend Developer',
                department: 'Engineering',
                type: 'Full-time',
                location: 'Bangalore, India',
                salary: '₹15-25 LPA',
                experience: 'Senior Level',
                description: 'We are looking for a skilled Frontend Developer to join our dynamic team. You will be responsible for developing user interface components and implementing them following well-known React.js workflows.',
                requirements: 'Bachelor\'s degree in Computer Science or related field. 3+ years of experience with React.js, JavaScript, HTML5, CSS3. Experience with Redux, TypeScript, and modern build tools.',
                benefits: 'Competitive salary, health insurance, flexible working hours, remote work options, learning and development opportunities.',
                skills: 'React.js,JavaScript,TypeScript,HTML5,CSS3,Redux,Git',
                preferredSkills: 'Next.js,GraphQL,Jest,Webpack',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                applicationEmail: 'careers@techcompany.com',
                status: 'Active',
                urgency: 'High',
                postedDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
                applications: 12,
                views: 45
            },
            {
                id: 'demo_job_2',
                title: 'UI/UX Designer',
                department: 'Design',
                type: 'Full-time',
                location: 'Mumbai, India',
                salary: '₹8-15 LPA',
                experience: 'Mid Level',
                description: 'Join our design team to create beautiful and intuitive user experiences. You will work closely with product managers and developers to bring ideas to life.',
                requirements: 'Bachelor\'s degree in Design or related field. 2+ years of experience in UI/UX design. Proficiency in Figma, Adobe Creative Suite, and prototyping tools.',
                benefits: 'Creative environment, health insurance, team outings, professional development budget.',
                skills: 'Figma,Adobe XD,Photoshop,Illustrator,Prototyping,User Research',
                preferredSkills: 'Sketch,InVision,Principle,After Effects',
                deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                applicationEmail: 'design@creativeagency.com',
                status: 'Active',
                urgency: 'Normal',
                postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                applications: 8,
                views: 32
            },
            {
                id: 'demo_job_3',
                title: 'Marketing Intern',
                department: 'Marketing',
                type: 'Internship',
                location: 'Delhi, India',
                salary: '₹15,000-25,000 per month',
                experience: 'Entry Level',
                description: 'Great opportunity for students to gain hands-on experience in digital marketing. You will assist in campaign planning, content creation, and social media management.',
                requirements: 'Currently pursuing or recently completed degree in Marketing, Communications, or related field. Basic understanding of digital marketing concepts.',
                benefits: 'Mentorship program, certificate of completion, potential for full-time offer, flexible schedule.',
                skills: 'Social Media Marketing,Content Writing,Google Analytics,SEO Basics',
                preferredSkills: 'Adobe Creative Suite,Video Editing,Email Marketing',
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                applicationEmail: 'internships@marketingfirm.com',
                status: 'Active',
                urgency: 'Normal',
                postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                applications: 25,
                views: 78
            }
        ];
        
        jobSystem.jobs = demoJobs;
        localStorage.setItem('skillsync_jobs', JSON.stringify(demoJobs));
        jobSystem.loadJobs();
        jobSystem.updateStats();
    }
});

// Add slideInRight animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

console.log('🚀 Job Posting System loaded successfully!');
