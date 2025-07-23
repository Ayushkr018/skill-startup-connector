// job-post-updated.js - Enhanced Job Posting System with Application Management

class EnhancedJobPostingSystem {
    constructor() {
        this.jobs = JSON.parse(localStorage.getItem('skillsync_jobs')) || [];
        this.applications = JSON.parse(localStorage.getItem('skillsync_applications')) || [];
        this.currentJobId = null;
        this.currentApplicationId = null;
        this.skillsArray = [];
        this.preferredSkillsArray = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadJobs();
        this.loadApplications();
        this.updateStats();
        this.updateTabCounts();
        this.populateJobFilter();
    }

    bindEvents() {
        // Existing skill input handling
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

        // Modal close handlers
        document.getElementById('jobModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'jobModal') this.closeJobModal();
        });

        document.getElementById('applicationDetailsModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'applicationDetailsModal') this.closeApplicationDetailsModal();
        });

        document.getElementById('applyJobModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'applyJobModal') this.closeApplyJobModal();
        });
    }

    // Generate unique ID
    generateId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get initials from name
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

        if (!container || !hiddenInput) return;

        container.innerHTML = skillsArray.map(skill => `
            <div class="skill-tag-removable">
                <span>${skill}</span>
                <button type="button" onclick="jobSystem.removeSkill('${skill}', '${type}')">&times;</button>
            </div>
        `).join('');

        hiddenInput.value = skillsArray.join(',');
    }

    // Save job with enhanced features
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

        // Get application requirements
        const selectedRequirements = [];
        document.querySelectorAll('input[name="applicationRequirements"]:checked').forEach(checkbox => {
            selectedRequirements.push(checkbox.value);
        });

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
            applicationRequirements: selectedRequirements,
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
            const index = this.jobs.findIndex(j => j.id === this.currentJobId);
            if (index !== -1) {
                this.jobs[index] = jobData;
                this.showNotification('Job updated successfully!', 'success');
            }
        } else {
            this.jobs.push(jobData);
            this.showNotification('Job posted successfully!', 'success');
        }

        // Save to localStorage
        localStorage.setItem('skillsync_jobs', JSON.stringify(this.jobs));

        // Refresh display
        this.loadJobs();
        this.updateStats();
        this.updateTabCounts();
        this.populateJobFilter();
        this.closeJobModal();
    }

    // Load and display jobs
    loadJobs() {
        const jobsGrid = document.getElementById('jobsGrid');
        const emptyState = document.getElementById('jobsEmptyState');

        if (!jobsGrid) return;

        if (this.jobs.length === 0) {
            jobsGrid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        
        const jobsHTML = this.jobs.map(job => this.createJobCard(job)).join('');
        jobsGrid.innerHTML = jobsHTML;
    }

    // Create enhanced job card with apply button
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
                        <button class="btn-icon" style="background: rgba(46, 204, 113, 0.1); color: #2ecc71;" 
                                onclick="jobSystem.openApplyJobModal('${job.id}')" title="Test Apply">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="jobSystem.deleteJob('${job.id}')" title="Delete Job">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Open job application modal (for testing)
    openApplyJobModal(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        const modal = document.getElementById('applyJobModal');
        const title = document.getElementById('applyJobTitle');
        const requiredDocs = document.getElementById('requiredDocuments');

        title.textContent = `Apply for ${job.title}`;

        // Populate required documents
        if (job.applicationRequirements && job.applicationRequirements.length > 0) {
            requiredDocs.innerHTML = job.applicationRequirements.map(req => {
                const labels = {
                    'resume': 'Resume/CV',
                    'cover_letter': 'Cover Letter',
                    'portfolio': 'Portfolio/Work Samples',
                    'github': 'GitHub Profile URL',
                    'linkedin': 'LinkedIn Profile URL',
                    'certifications': 'Certifications'
                };
                
                const inputType = ['github', 'linkedin'].includes(req) ? 'url' : 'text';
                const placeholder = ['github', 'linkedin'].includes(req) ? `Your ${labels[req]}` : 'Upload or provide link';

                return `
                    <div class="form-group">
                        <label for="${req}">${labels[req]} *</label>
                        <input type="${inputType}" id="${req}" name="${req}" required placeholder="${placeholder}">
                    </div>
                `;
            }).join('');
        } else {
            requiredDocs.innerHTML = `
                <div class="form-group">
                    <label for="resume">Resume/CV *</label>
                    <input type="text" id="resume" name="resume" required placeholder="Upload or provide link to your resume">
                </div>
            `;
        }

        this.currentJobId = jobId;
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Close apply job modal
    closeApplyJobModal() {
        const modal = document.getElementById('applyJobModal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
        
        // Reset form
        document.getElementById('applicationForm').reset();
        this.currentJobId = null;
    }

    // Submit application
    submitApplication() {
        const form = document.getElementById('applicationForm');
        const formData = new FormData(form);
        const job = this.jobs.find(j => j.id === this.currentJobId);
        
        if (!job) return;

        // Validate required fields
        const name = formData.get('applicantName');
        const email = formData.get('applicantEmail');
        const phone = formData.get('applicantPhone');

        if (!name || !email || !phone) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Get required documents
        const documents = {};
        if (job.applicationRequirements) {
            job.applicationRequirements.forEach(req => {
                const value = formData.get(req);
                if (value) documents[req] = value;
            });
        }

        // Create application object
        const applicationData = {
            id: this.generateId(),
            jobId: this.currentJobId,
            jobTitle: job.title,
            applicantName: name,
            applicantEmail: email,
            applicantPhone: phone,
            experience: formData.get('applicantExperience') || '0-1',
            skills: formData.get('applicantSkills') || '',
            coverLetter: formData.get('coverLetter') || '',
            documents: documents,
            status: 'Pending',
            appliedDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        // Add to applications array
        this.applications.push(applicationData);
        
        // Update job application count
        job.applications = (job.applications || 0) + 1;
        
        // Save to localStorage
        localStorage.setItem('skillsync_applications', JSON.stringify(this.applications));
        localStorage.setItem('skillsync_jobs', JSON.stringify(this.jobs));

        this.showNotification('Application submitted successfully!', 'success');
        
        // Refresh displays
        this.loadJobs();
        this.loadApplications();
        this.updateStats();
        this.updateTabCounts();
        this.closeApplyJobModal();
    }

    // Load and display applications
    loadApplications() {
        const applicationsGrid = document.getElementById('applicationsGrid');
        const emptyState = document.getElementById('applicationsEmptyState');

        if (!applicationsGrid) return;

        if (this.applications.length === 0) {
            applicationsGrid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        
        const applicationsHTML = this.applications.map(app => this.createApplicationCard(app)).join('');
        applicationsGrid.innerHTML = applicationsHTML;
    }

    // Create application card
    createApplicationCard(application) {
        const appliedDate = new Date(application.appliedDate).toLocaleDateString();
        const initials = this.getInitials(application.applicantName);
        const statusClass = `status-${application.status.toLowerCase().replace(' ', '-')}`;
        const skillsList = application.skills ? application.skills.split(',').slice(0, 4) : [];

        return `
            <div class="application-card" data-application-id="${application.id}">
                <div class="application-header">
                    <div class="applicant-info">
                        <div class="applicant-avatar">${initials}</div>
                        <div class="applicant-details">
                            <h4>${application.applicantName}</h4>
                            <div class="applicant-meta">
                                <span><i class="fas fa-envelope"></i> ${application.applicantEmail}</span>
                                <span><i class="fas fa-phone"></i> ${application.applicantPhone}</span>
                                <span><i class="fas fa-clock"></i> ${application.experience} years exp</span>
                            </div>
                        </div>
                    </div>
                    <div class="application-status">
                        <span class="status-badge ${statusClass}">${application.status}</span>
                    </div>
                </div>

                <div class="application-job">
                    <i class="fas fa-briefcase"></i> Applied for: ${application.jobTitle}
                </div>

                ${skillsList.length > 0 ? `
                <div class="application-skills">
                    <h5>Skills:</h5>
                    <div class="skill-tags">
                        ${skillsList.map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                        ${application.skills.split(',').length > 4 ? `<span class="skill-tag">+${application.skills.split(',').length - 4} more</span>` : ''}
                    </div>
                </div>
                ` : ''}

                <div class="application-actions">
                    <div class="application-date">
                        <i class="fas fa-calendar"></i> Applied on ${appliedDate}
                    </div>
                    <div class="action-buttons">
                        <button class="btn-action btn-view-app" onclick="jobSystem.viewApplication('${application.id}')" title="View Details">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${application.status === 'Pending' || application.status === 'Under Review' ? `
                            <button class="btn-action btn-accept" onclick="jobSystem.updateApplicationStatus('${application.id}', 'Accepted')" title="Accept Application">
                                <i class="fas fa-check"></i> Accept
                            </button>
                            <button class="btn-action btn-reject" onclick="jobSystem.updateApplicationStatus('${application.id}', 'Rejected')" title="Reject Application">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // View application details
    viewApplication(applicationId) {
        const application = this.applications.find(a => a.id === applicationId);
        if (!application) return;

        const modal = document.getElementById('applicationDetailsModal');
        const title = document.getElementById('applicationDetailsTitle');
        const content = document.getElementById('applicationDetailsContent');

        title.textContent = `${application.applicantName} - Application`;
        content.innerHTML = this.createApplicationDetailsHTML(application);

        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Create application details HTML
    createApplicationDetailsHTML(application) {
        const appliedDate = new Date(application.appliedDate).toLocaleDateString();
        const initials = this.getInitials(application.applicantName);

        return `
            <div class="application-details">
                <div class="application-details-header">
                    <div class="applicant-profile">
                        <div class="applicant-avatar-large">
                            ${initials}
                        </div>
                        <div class="applicant-title-section">
                            <h2>${application.applicantName}</h2>
                            <div class="applicant-meta-large">
                                <span><i class="fas fa-envelope"></i> ${application.applicantEmail}</span>
                                <span><i class="fas fa-phone"></i> ${application.applicantPhone}</span>
                                <span><i class="fas fa-briefcase"></i> ${application.experience} years experience</span>
                            </div>
                        </div>
                    </div>
                    <div class="application-status-section">
                        <span class="status-badge status-${application.status.toLowerCase().replace(' ', '-')}">${application.status}</span>
                    </div>
                </div>

                <div class="application-details-grid">
                    <div class="detail-section">
                        <h4><i class="fas fa-briefcase"></i> Job Information</h4>
                        <p><strong>Position:</strong> ${application.jobTitle}</p>
                        <p><strong>Applied Date:</strong> ${appliedDate}</p>
                        <p><strong>Current Status:</strong> ${application.status}</p>
                    </div>

                    ${application.skills ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-code"></i> Skills & Expertise</h4>
                        <div class="skills-list">
                            ${application.skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    ${application.coverLetter ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-comment"></i> Cover Letter</h4>
                        <p>${application.coverLetter}</p>
                    </div>
                    ` : ''}

                    ${Object.keys(application.documents || {}).length > 0 ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-file-alt"></i> Submitted Documents</h4>
                        <div class="documents-list">
                            ${Object.entries(application.documents).map(([key, value]) => `
                                <div class="document-item">
                                    <strong>${this.formatDocumentName(key)}:</strong>
                                    ${value.startsWith('http') ? `<a href="${value}" target="_blank">${value}</a>` : value}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="application-details-actions">
                    <button class="btn-secondary" onclick="jobSystem.closeApplicationDetailsModal()">Close</button>
                    ${application.status === 'Pending' || application.status === 'Under Review' ? `
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn-accept" onclick="jobSystem.updateApplicationStatus('${application.id}', 'Accepted')">
                                <i class="fas fa-check"></i> Accept Application
                            </button>
                            <button class="btn-reject" onclick="jobSystem.updateApplicationStatus('${application.id}', 'Rejected')">
                                <i class="fas fa-times"></i> Reject Application
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>

            <style>
                .application-details-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f0f0f0;
                }

                .applicant-profile {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .applicant-avatar-large {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2rem;
                    font-weight: 600;
                }

                .applicant-title-section h2 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                    color: #333;
                }

                .applicant-meta-large {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    color: #666;
                    font-size: 0.9rem;
                }

                .application-status-section {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .application-details-grid {
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

                .documents-list {
                    display: grid;
                    gap: 0.5rem;
                }

                .document-item {
                    padding: 0.75rem;
                    background: #f8f9ff;
                    border-radius: 8px;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                }

                .document-item a {
                    color: #667eea;
                    text-decoration: none;
                }

                .document-item a:hover {
                    text-decoration: underline;
                }

                .application-details-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f0f0f0;
                }

                @media (max-width: 768px) {
                    .application-details-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .applicant-profile {
                        flex-direction: column;
                        text-align: center;
                    }

                    .applicant-meta-large {
                        justify-content: center;
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .application-details-actions {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            </style>
        `;
    }

    // Format document name for display
    formatDocumentName(key) {
        const names = {
            'resume': 'Resume/CV',
            'cover_letter': 'Cover Letter',
            'portfolio': 'Portfolio',
            'github': 'GitHub Profile',
            'linkedin': 'LinkedIn Profile',
            'certifications': 'Certifications'
        };
        return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
    }

    // Close application details modal
    closeApplicationDetailsModal() {
        const modal = document.getElementById('applicationDetailsModal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    // Update application status (Accept/Reject)
    updateApplicationStatus(applicationId, newStatus) {
        const application = this.applications.find(a => a.id === applicationId);
        if (!application) return;

        const oldStatus = application.status;
        application.status = newStatus;
        application.lastUpdated = new Date().toISOString();

        // Save to localStorage
        localStorage.setItem('skillsync_applications', JSON.stringify(this.applications));

        // Show notification with real-time effect
        const actionText = newStatus === 'Accepted' ? 'accepted' : 'rejected';
        this.showNotification(`Application ${actionText} successfully!`, newStatus === 'Accepted' ? 'success' : 'info');

        // Refresh applications display
        this.loadApplications();
        this.updateTabCounts();

        // If modal is open, close it
        if (document.getElementById('applicationDetailsModal').classList.contains('active')) {
            this.closeApplicationDetailsModal();
        }
    }

    // Populate job filter dropdown
    populateJobFilter() {
        const jobFilter = document.getElementById('jobFilterApp');
        if (!jobFilter) return;

        jobFilter.innerHTML = '<option value="">All Jobs</option>';
        
        this.jobs.forEach(job => {
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = job.title;
            jobFilter.appendChild(option);
        });
    }

    // Filter applications
    filterApplications() {
        const jobFilter = document.getElementById('jobFilterApp')?.value || '';
        const statusFilter = document.getElementById('appStatusFilter')?.value || '';
        const searchFilter = document.getElementById('searchApplicants')?.value.toLowerCase() || '';

        let filteredApplications = this.applications.filter(app => {
            return (!jobFilter || app.jobId === jobFilter) &&
                   (!statusFilter || app.status === statusFilter) &&
                   (!searchFilter || 
                    app.applicantName.toLowerCase().includes(searchFilter) ||
                    app.applicantEmail.toLowerCase().includes(searchFilter) ||
                    app.jobTitle.toLowerCase().includes(searchFilter));
        });

        const applicationsGrid = document.getElementById('applicationsGrid');
        const emptyState = document.getElementById('applicationsEmptyState');

        if (!applicationsGrid) return;

        if (filteredApplications.length === 0) {
            applicationsGrid.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
                emptyState.innerHTML = `
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No Applications Found</h3>
                    <p>No applications match your current filters. Try adjusting your search criteria.</p>
                    <button class="btn-primary" onclick="jobSystem.clearApplicationFilters()">
                        <i class="fas fa-times"></i>
                        <span>Clear Filters</span>
                    </button>
                `;
            }
        } else {
            if (emptyState) emptyState.style.display = 'none';
            const applicationsHTML = filteredApplications.map(app => this.createApplicationCard(app)).join('');
            applicationsGrid.innerHTML = applicationsHTML;
        }
    }

    // Clear application filters
    clearApplicationFilters() {
        document.getElementById('jobFilterApp').value = '';
        document.getElementById('appStatusFilter').value = '';
        document.getElementById('searchApplicants').value = '';
        this.loadApplications();
    }

    // Update tab counts
    updateTabCounts() {
        const jobsCount = document.getElementById('jobsCount');
        const applicationsCount = document.getElementById('applicationsCount');

        if (jobsCount) jobsCount.textContent = this.jobs.length;
        if (applicationsCount) applicationsCount.textContent = this.applications.length;
    }

    // Update statistics
    updateStats() {
        const totalJobs = this.jobs.length;
        const activeJobs = this.jobs.filter(j => j.status === 'Active').length;
        const totalApplications = this.applications.length;

        const totalJobsEl = document.getElementById('totalJobs');
        const activeJobsEl = document.getElementById('activeJobs');
        const applicationCountEl = document.getElementById('applicationCount');

        if (totalJobsEl) totalJobsEl.textContent = totalJobs;
        if (activeJobsEl) activeJobsEl.textContent = activeJobs;
        if (applicationCountEl) applicationCountEl.textContent = totalApplications;
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

    // All other existing methods remain the same...
    // (Include all previous methods like openJobModal, closeJobModal, resetForm, etc.)
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

function filterApplications() {
    jobSystem.filterApplications();
}

function clearApplicationFilters() {
    jobSystem.clearApplicationFilters();
}

function loadJobs() {
    jobSystem.loadJobs();
}

function loadApplications() {
    jobSystem.loadApplications();
}

function updateStats() {
    jobSystem.updateStats();
}

// Initialize enhanced job posting system
let jobSystem;

document.addEventListener('DOMContentLoaded', function() {
    jobSystem = new EnhancedJobPostingSystem();
    
    // Add some demo data if no jobs exist
    if (jobSystem.jobs.length === 0) {
        // Add demo jobs and applications
        jobSystem.addDemoData();
    }
});

// Enhanced JobPostingSystem prototype methods (include all existing methods)
EnhancedJobPostingSystem.prototype.addDemoData = function() {
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
            applicationRequirements: ['resume', 'portfolio', 'github'],
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            applicationEmail: 'careers@techcompany.com',
            status: 'Active',
            urgency: 'High',
            postedDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            applications: 5,
            views: 45
        }
    ];

    const demoApplications = [
        {
            id: 'demo_app_1',
            jobId: 'demo_job_1',
            jobTitle: 'Senior Frontend Developer',
            applicantName: 'Rahul Kumar',
            applicantEmail: 'rahul@email.com',
            applicantPhone: '+91 9876543210',
            experience: '4-5',
            skills: 'React.js, JavaScript, TypeScript, Node.js',
            coverLetter: 'I am excited to apply for this position as I have extensive experience in React.js development...',
            documents: {
                resume: 'https://example.com/rahul-resume.pdf',
                portfolio: 'https://rahul-portfolio.dev',
                github: 'https://github.com/rahulkumar'
            },
            status: 'Pending',
            appliedDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        }
    ];

    this.jobs = demoJobs;
    this.applications = demoApplications;
    localStorage.setItem('skillsync_jobs', JSON.stringify(demoJobs));
    localStorage.setItem('skillsync_applications', JSON.stringify(demoApplications));
    
    this.loadJobs();
    this.loadApplications();
    this.updateStats();
    this.updateTabCounts();
    this.populateJobFilter();
};

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

console.log('🚀 Enhanced Job Posting System with Application Management loaded successfully!');
