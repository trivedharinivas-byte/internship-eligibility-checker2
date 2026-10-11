package com.internship.dto;

public class DashboardStatsDto {
    private long totalInternships;
    private long totalStudents;
    private long totalApplications;
    private long shortlistedCount;
    private long selectedCount;
    private long rejectedCount;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalInternships, long totalStudents, long totalApplications,
                             long shortlistedCount, long selectedCount, long rejectedCount) {
        this.totalInternships = totalInternships;
        this.totalStudents = totalStudents;
        this.totalApplications = totalApplications;
        this.shortlistedCount = shortlistedCount;
        this.selectedCount = selectedCount;
        this.rejectedCount = rejectedCount;
    }

    public long getTotalInternships() {
        return totalInternships;
    }

    public void setTotalInternships(long totalInternships) {
        this.totalInternships = totalInternships;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getShortlistedCount() {
        return shortlistedCount;
    }

    public void setShortlistedCount(long shortlistedCount) {
        this.shortlistedCount = shortlistedCount;
    }

    public long getSelectedCount() {
        return selectedCount;
    }

    public void setSelectedCount(long selectedCount) {
        this.selectedCount = selectedCount;
    }

    public long getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }
}
