// team.js - Complete Team Management System

class TeamManagementSystem {
    constructor() {
        this.teamMembers = JSON.parse(localStorage.getItem('skillsync_team')) || [];
        this.currentMemberId = null;
        this.skillsArray = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTeamMembers();
        this.updateStats();
    }

    bindEvents() {
        // Skills input handling
        const skillInput = document.getElementById('skillInput');
        
        if (skillInput) {
            skillInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addSkill(skillInput.value.trim());
                }
            });
        }

        // Modal close on outside click
        document.getElementById('memberModal').addEventListener('click', (e) => {
            if (e.target.id === 'memberModal') {
                this.closeMemberModal();
            }
        });

        document.getElementById('memberDetailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'memberDetailsModal') {
                this.closeMemberDetailsModal();
            }
        });
    }

    // Generate unique ID
    generateId() {
        return 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get initials from name
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // Add skill to array
    addSkill(skill) {
        if (!skill || this.skillsArray.includes(skill)) return;

        this.skillsArray.push(skill);
        this.renderSkillTags();
        document.getElementById('skillInput').value = '';
    }

    // Remove skill from array
    removeSkill(skill) {
        const index = this.skillsArray.indexOf(skill);
        if (index > -1) {
            this.skillsArray.splice(index, 1);
            this.renderSkillTags();
        }
    }

    // Render skill tags
    renderSkillTags() {
        const container = document.getElementById('skillsTags');
        const hiddenInput = document.getElementById('memberSkills');

        container.innerHTML = this.skillsArray.map(skill => `
            <div class="skill-tag-removable">
                <span>${skill}</span>
                <button type="button" onclick="teamSystem.removeSkill('${skill}')">&times;</button>
            </div>
        `).join('');

        hiddenInput.value = this.skillsArray.join(',');
    }

    // Open member modal
    openMemberModal(memberId = null) {
        this.currentMemberId = memberId;
        const modal = document.getElementById('memberModal');
        const modalTitle = document.getElementById('modalTitle');
        const saveButtonText = document.getElementById('saveButtonText');

        if (memberId) {
            // Edit mode
            modalTitle.textContent = 'Edit Team Member';
            saveButtonText.textContent = 'Update Member';
            this.loadMemberForEdit(memberId);
        } else {
            // Create mode
            modalTitle.textContent = 'Add Team Member';
            saveButtonText.textContent = 'Add Member';
            this.resetForm();
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Close member modal
    closeMemberModal() {
        const modal = document.getElementById('memberModal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
        this.resetForm();
    }

    // Reset form
    resetForm() {
        document.getElementById('memberForm').reset();
        this.skillsArray = [];
        this.renderSkillTags();
        this.currentMemberId = null;
        
        // Uncheck all permissions
        document.querySelectorAll('input[name="permissions"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    // Load member for editing
    loadMemberForEdit(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (!member) return;

        // Fill form fields
        document.getElementById('memberName').value = member.name || '';
        document.getElementById('memberEmail').value = member.email || '';
        document.getElementById('memberPhone').value = member.phone || '';
        document.getElementById('memberLinkedIn').value = member.linkedin || '';
        document.getElementById('memberRole').value = member.role || '';
        document.getElementById('memberDepartment').value = member.department || '';
        document.getElementById('joinDate').value = member.joinDate || '';
        document.getElementById('memberStatus').value = member.status || '';
        document.getElementById('memberBio').value = member.bio || '';

        // Load skills
        this.skillsArray = member.skills ? member.skills.split(',').filter(s => s.trim()) : [];
        this.renderSkillTags();

        // Load permissions
        const permissions = member.permissions || [];
        document.querySelectorAll('input[name="permissions"]').forEach(checkbox => {
            checkbox.checked = permissions.includes(checkbox.value);
        });
    }

    // Save member
    saveMember() {
        const form = document.getElementById('memberForm');
        const formData = new FormData(form);
        
        // Validate required fields
        const requiredFields = ['memberName', 'memberEmail', 'memberRole', 'memberDepartment', 'joinDate'];
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

        // Get selected permissions
        const selectedPermissions = [];
        document.querySelectorAll('input[name="permissions"]:checked').forEach(checkbox => {
            selectedPermissions.push(checkbox.value);
        });

        // Create member object
        const memberData = {
            id: this.currentMemberId || this.generateId(),
            name: formData.get('memberName'),
            email: formData.get('memberEmail'),
            phone: formData.get('memberPhone'),
            linkedin: formData.get('memberLinkedIn'),
            role: formData.get('memberRole'),
            department: formData.get('memberDepartment'),
            joinDate: formData.get('joinDate'),
            status: formData.get('memberStatus'),
            bio: formData.get('memberBio'),
            skills: this.skillsArray.join(','),
            permissions: selectedPermissions,
            addedDate: this.currentMemberId ? 
                this.teamMembers.find(m => m.id === this.currentMemberId)?.addedDate : 
                new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };

        // Save to team array
        if (this.currentMemberId) {
            // Update existing member
            const index = this.teamMembers.findIndex(m => m.id === this.currentMemberId);
            if (index !== -1) {
                this.teamMembers[index] = memberData;
                this.showNotification('Team member updated successfully!', 'success');
            }
        } else {
            // Add new member
            this.teamMembers.push(memberData);
            this.showNotification('Team member added successfully!', 'success');
        }

        // Save to localStorage
        localStorage.setItem('skillsync_team', JSON.stringify(this.teamMembers));

        // Refresh display
        this.loadTeamMembers();
        this.updateStats();
        this.closeMemberModal();
    }

    // Load and display team members
    loadTeamMembers() {
        const teamGrid = document.getElementById('teamGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.teamMembers.length === 0) {
            teamGrid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        const membersHTML = this.teamMembers.map(member => this.createMemberCard(member)).join('');
        teamGrid.innerHTML = membersHTML;
    }

    // Create member card HTML
    createMemberCard(member) {
        const joinDate = new Date(member.joinDate).toLocaleDateString();
        const skillsList = member.skills ? member.skills.split(',').slice(0, 3) : [];
        const statusClass = `status-${member.status.toLowerCase().replace(' ', '-')}`;
        const initials = this.getInitials(member.name);
        const permissionsList = member.permissions ? member.permissions.slice(0, 2) : [];

        return `
            <div class="member-card" data-member-id="${member.id}">
                <div class="member-status">
                    <span class="status-badge ${statusClass}">${member.status}</span>
                </div>
                
                <div class="member-header">
                    <div class="member-avatar">
                        ${initials}
                    </div>
                    <div class="member-info">
                        <h3>${member.name}</h3>
                        <div class="member-role">${member.role}</div>
                        <div class="member-department">${member.department}</div>
                    </div>
                </div>
                
                ${skillsList.length > 0 ? `
                <div class="member-skills">
                    ${skillsList.map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                    ${member.skills.split(',').length > 3 ? `<span class="skill-tag">+${member.skills.split(',').length - 3} more</span>` : ''}
                </div>
                ` : ''}
                
                ${permissionsList.length > 0 ? `
                <div class="member-permissions">
                    <div class="permission-tags">
                        ${permissionsList.map(permission => `<span class="permission-tag">${this.formatPermission(permission)}</span>`).join('')}
                        ${member.permissions.length > 2 ? `<span class="permission-tag">+${member.permissions.length - 2} more</span>` : ''}
                    </div>
                </div>
                ` : ''}
                
                <div class="member-actions">
                    <div class="member-contact">
                        <div><i class="fas fa-envelope"></i> ${member.email}</div>
                        <div><i class="fas fa-calendar"></i> Joined ${joinDate}</div>
                    </div>
                    <div class="member-buttons">
                        <button class="btn-icon btn-view" onclick="teamSystem.viewMember('${member.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="teamSystem.openMemberModal('${member.id}')" title="Edit Member">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="teamSystem.deleteMember('${member.id}')" title="Remove Member">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Format permission for display
    formatPermission(permission) {
        return permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // View member details
    viewMember(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (!member) return;

        const modal = document.getElementById('memberDetailsModal');
        const title = document.getElementById('memberDetailsTitle');
        const content = document.getElementById('memberDetailsContent');

        title.textContent = member.name;
        content.innerHTML = this.createMemberDetailsHTML(member);

        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Create member details HTML
    createMemberDetailsHTML(member) {
        const joinDate = new Date(member.joinDate).toLocaleDateString();
        const addedDate = new Date(member.addedDate).toLocaleDateString();
        const initials = this.getInitials(member.name);

        return `
            <div class="member-details">
                <div class="member-details-header">
                    <div class="member-profile">
                        <div class="member-avatar-large">
                            ${initials}
                        </div>
                        <div class="member-title-section">
                            <h2>${member.name}</h2>
                            <div class="member-meta-large">
                                <span><i class="fas fa-briefcase"></i> ${member.role}</span>
                                <span><i class="fas fa-building"></i> ${member.department}</span>
                                <span><i class="fas fa-calendar"></i> Joined ${joinDate}</span>
                            </div>
                        </div>
                    </div>
                    <div class="member-status-section">
                        <span class="status-badge status-${member.status.toLowerCase().replace(' ', '-')}">${member.status}</span>
                    </div>
                </div>

                <div class="member-details-grid">
                    <div class="detail-section">
                        <h4><i class="fas fa-user"></i> Personal Information</h4>
                        <div class="detail-info">
                            <p><strong>Email:</strong> ${member.email}</p>
                            ${member.phone ? `<p><strong>Phone:</strong> ${member.phone}</p>` : ''}
                            ${member.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${member.linkedin}" target="_blank">${member.linkedin}</a></p>` : ''}
                        </div>
                    </div>

                    ${member.bio ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-info-circle"></i> Biography</h4>
                        <p>${member.bio}</p>
                    </div>
                    ` : ''}

                    ${member.skills ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-code"></i> Skills & Expertise</h4>
                        <div class="skills-list">
                            ${member.skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <div class="detail-section">
                        <h4><i class="fas fa-key"></i> Hiring Permissions</h4>
                        <div class="permissions-list">
                            ${member.permissions && member.permissions.length > 0 ? 
                                member.permissions.map(permission => `
                                    <div class="permission-item-display">
                                        <i class="fas fa-check-circle"></i>
                                        <span>${this.formatPermission(permission)}</span>
                                    </div>
                                `).join('') : 
                                '<p>No specific hiring permissions assigned</p>'
                            }
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4><i class="fas fa-history"></i> Member History</h4>
                        <div class="member-history">
                            <p><strong>Join Date:</strong> ${joinDate}</p>
                            <p><strong>Added to System:</strong> ${addedDate}</p>
                            <p><strong>Current Status:</strong> ${member.status}</p>
                        </div>
                    </div>
                </div>

                <div class="member-details-actions">
                    <button class="btn-secondary" onclick="teamSystem.closeMemberDetailsModal()">Close</button>
                    <button class="btn-primary" onclick="teamSystem.openMemberModal('${member.id}')">
                        <i class="fas fa-edit"></i> Edit Member
                    </button>
                </div>
            </div>

            <style>
                .member-details {
                    max-width: 100%;
                }

                .member-details-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f0f0f0;
                }

                .member-profile {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .member-avatar-large {
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

                .member-title-section h2 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                    color: #333;
                }

                .member-meta-large {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    color: #666;
                    font-size: 0.9rem;
                }

                .member-status-section {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .member-details-grid {
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

                .detail-info p {
                    margin-bottom: 0.5rem;
                    color: #666;
                }

                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .permissions-list {
                    display: grid;
                    gap: 0.5rem;
                }

                .permission-item-display {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #2ecc71;
                    font-weight: 500;
                }

                .member-history p {
                    margin-bottom: 0.5rem;
                    color: #666;
                }

                .member-details-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f0f0f0;
                }

                @media (max-width: 768px) {
                    .member-details-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .member-profile {
                        flex-direction: column;
                        text-align: center;
                    }

                    .member-meta-large {
                        justify-content: center;
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .member-details-actions {
                        flex-direction: column;
                    }
                }
            </style>
        `;
    }

    // Close member details modal
    closeMemberDetailsModal() {
        const modal = document.getElementById('memberDetailsModal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    // Delete member
    deleteMember(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (!member) return;

        if (!confirm(`Are you sure you want to remove ${member.name} from the team? This action cannot be undone.`)) {
            return;
        }

        this.teamMembers = this.teamMembers.filter(m => m.id !== memberId);
        localStorage.setItem('skillsync_team', JSON.stringify(this.teamMembers));
        
        this.showNotification('Team member removed successfully', 'success');
        this.loadTeamMembers();
        this.updateStats();
    }

    // Update statistics
    updateStats() {
        const totalMembers = this.teamMembers.length;
        const activeMembers = this.teamMembers.filter(m => m.status === 'Active').length;
        const departments = [...new Set(this.teamMembers.map(m => m.department))].length;

        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('activeMembers').textContent = activeMembers;
        document.getElementById('departmentCount').textContent = departments;
    }

    // Filter members
    filterMembers() {
        const departmentFilter = document.getElementById('departmentFilter').value;
        const roleFilter = document.getElementById('roleFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        let filteredMembers = this.teamMembers.filter(member => {
            return (!departmentFilter || member.department === departmentFilter) &&
                   (!roleFilter || member.role === roleFilter) &&
                   (!statusFilter || member.status === statusFilter) &&
                   (!searchFilter || 
                    member.name.toLowerCase().includes(searchFilter) ||
                    member.email.toLowerCase().includes(searchFilter) ||
                    member.role.toLowerCase().includes(searchFilter) ||
                    (member.skills && member.skills.toLowerCase().includes(searchFilter)));
        });

        const teamGrid = document.getElementById('teamGrid');
        const emptyState = document.getElementById('emptyState');

        if (filteredMembers.length === 0) {
            teamGrid.innerHTML = '';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No Members Found</h3>
                <p>No team members match your current filters. Try adjusting your search criteria.</p>
                <button class="btn-primary" onclick="teamSystem.clearFilters()">
                    <i class="fas fa-times"></i>
                    <span>Clear Filters</span>
                </button>
            `;
        } else {
            emptyState.style.display = 'none';
            const membersHTML = filteredMembers.map(member => this.createMemberCard(member)).join('');
            teamGrid.innerHTML = membersHTML;
        }
    }

    // Clear filters
    clearFilters() {
        document.getElementById('departmentFilter').value = '';
        document.getElementById('roleFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('searchFilter').value = '';
        this.loadTeamMembers();
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

function openMemberModal(memberId = null) {
    teamSystem.openMemberModal(memberId);
}

function closeMemberModal() {
    teamSystem.closeMemberModal();
}

function saveMember() {
    teamSystem.saveMember();
}

function filterMembers() {
    teamSystem.filterMembers();
}

function clearFilters() {
    teamSystem.clearFilters();
}

function loadTeamMembers() {
    teamSystem.loadTeamMembers();
}

function updateStats() {
    teamSystem.updateStats();
}

// Initialize team management system
let teamSystem;

document.addEventListener('DOMContentLoaded', function() {
    teamSystem = new TeamManagementSystem();
    
    // Add some demo data if no members exist
    if (teamSystem.teamMembers.length === 0) {
        const demoMembers = [
            {
                id: 'demo_member_1',
                name: 'Rahul Sharma',
                email: 'rahul@company.com',
                phone: '+91 9876543210',
                linkedin: 'https://linkedin.com/in/rahulsharma',
                role: 'Founder',
                department: 'Operations',
                joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'Active',
                bio: 'Passionate entrepreneur with 5+ years of experience in building scalable tech products. Led multiple successful product launches.',
                skills: 'Leadership,Product Strategy,Business Development,Team Management',
                permissions: ['view_candidates', 'review_applications', 'schedule_interviews', 'make_decisions', 'post_jobs', 'manage_team'],
                addedDate: new Date().toISOString(),
                updatedDate: new Date().toISOString()
            },
            {
                id: 'demo_member_2',
                name: 'Priya Patel',
                email: 'priya@company.com',
                phone: '+91 9876543211',
                linkedin: 'https://linkedin.com/in/priyapatel',
                role: 'CTO',
                department: 'Engineering',
                joinDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'Active',
                bio: 'Full-stack developer turned CTO with expertise in React, Node.js, and AI/ML. Passionate about building scalable architectures.',
                skills: 'React.js,Node.js,Python,AI/ML,System Design,Team Leadership',
                permissions: ['view_candidates', 'review_applications', 'schedule_interviews', 'post_jobs'],
                addedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'demo_member_3',
                name: 'Amit Kumar',
                email: 'amit@company.com',
                phone: '+91 9876543212',
                role: 'Lead',
                department: 'Design',
                joinDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'Active',
                bio: 'Creative UI/UX designer with a keen eye for user experience. Specialized in creating intuitive and beautiful interfaces.',
                skills: 'Figma,Adobe XD,UI/UX Design,Prototyping,User Research',
                permissions: ['view_candidates', 'review_applications'],
                addedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        teamSystem.teamMembers = demoMembers;
        localStorage.setItem('skillsync_team', JSON.stringify(demoMembers));
        teamSystem.loadTeamMembers();
        teamSystem.updateStats();
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

console.log('🚀 Team Management System loaded successfully!');