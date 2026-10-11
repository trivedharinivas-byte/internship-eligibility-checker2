package com.internship.service;

import com.internship.dto.AuthRequest;
import com.internship.dto.AuthResponse;
import com.internship.dto.ProfileRequest;
import com.internship.dto.RegisterRequest;
import com.internship.model.Role;
import com.internship.model.StudentProfile;
import com.internship.model.User;
import com.internship.repository.StudentProfileRepository;
import com.internship.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository, StudentProfileRepository studentProfileRepository) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    public BCryptPasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with email " + request.getEmail() + " already exists.");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(request.getEmail(), hashedPassword, request.getName(), role);
        user = userRepository.save(user);

        Long profileId = null;
        if (role == Role.STUDENT) {
            StudentProfile profile = new StudentProfile();
            profile.setUser(user);
            profile.setBranch(request.getBranch() != null ? request.getBranch() : "Computer Science");
            profile.setYear(request.getYear() != null ? request.getYear() : "3rd Year");
            profile.setCgpa(request.getCgpa() != null ? request.getCgpa() : 7.0);
            profile.setSkills(request.getSkills() != null ? request.getSkills() : "Java, C++, HTML");
            profile.setCertifications(request.getCertifications() != null ? request.getCertifications() : "");
            profile.setPhone(request.getPhone() != null ? request.getPhone() : "");
            profile.setResumeLink(request.getResumeLink() != null ? request.getResumeLink() : "");
            profile.setUpdatedAt(LocalDateTime.now());
            profile = studentProfileRepository.save(profile);
            profileId = profile.getId();
        }

        String token = UUID.randomUUID().toString();
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), profileId, token, "Registration successful");
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        Long profileId = null;
        if (user.getRole() == Role.STUDENT) {
            Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(user.getId());
            if (profileOpt.isPresent()) {
                profileId = profileOpt.get().getId();
            }
        }

        String token = UUID.randomUUID().toString();
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), profileId, token, "Login successful");
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<StudentProfile> getStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId);
    }

    @Transactional
    public StudentProfile updateStudentProfile(Long userId, ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
            userRepository.save(user);
        }

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile newProfile = new StudentProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        if (request.getBranch() != null) profile.setBranch(request.getBranch());
        if (request.getYear() != null) profile.setYear(request.getYear());
        if (request.getCgpa() != null) profile.setCgpa(request.getCgpa());
        if (request.getSkills() != null) profile.setSkills(request.getSkills());
        if (request.getCertifications() != null) profile.setCertifications(request.getCertifications());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getResumeLink() != null) profile.setResumeLink(request.getResumeLink());
        profile.setUpdatedAt(LocalDateTime.now());

        return studentProfileRepository.save(profile);
    }

    public List<StudentProfile> getAllStudentProfiles() {
        return studentProfileRepository.findAll();
    }
}
