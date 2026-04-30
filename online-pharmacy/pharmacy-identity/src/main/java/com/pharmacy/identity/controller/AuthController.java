package com.pharmacy.identity.controller;

import com.pharmacy.common.api.ApiResponse;
import com.pharmacy.common.exception.BadRequestException;
import com.pharmacy.identity.dto.AuthResponse;
import com.pharmacy.identity.dto.LoginRequest;
import com.pharmacy.identity.dto.UpdateProfileRequest;
import com.pharmacy.identity.dto.OtpRequest;
import com.pharmacy.identity.dto.OtpResponse;
import com.pharmacy.identity.dto.OtpVerificationRequest;
import com.pharmacy.identity.dto.SignupRequest;
import com.pharmacy.identity.dto.UserDTO;
import com.pharmacy.identity.entity.OtpVerification.OtpType;
import com.pharmacy.identity.security.JwtUserPrincipal;
import com.pharmacy.identity.service.AuthService;
import com.pharmacy.identity.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Validated
@Tag(name = "Authentication", description = "User authentication and registration APIs")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthService authService, OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }

    @PostMapping("/signup")
    @Operation(summary = "Register a new user", description = "Creates a new customer account")
    public ResponseEntity<ApiResponse<UserDTO>> signup(@Valid @RequestBody SignupRequest request) {
        UserDTO user = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(user, "Registration successful"));
    }

    @PostMapping("/signup/otp/generate")
    @Operation(summary = "Generate OTP for signup", description = "Sends OTP to email for verification before registration")
    public ResponseEntity<ApiResponse<OtpResponse>> signupGenerateOtp(@Valid @RequestBody SignupRequest request) {
        authService.signupWithOtp(request);
        return ResponseEntity.ok(ApiResponse.of(OtpResponse.builder()
                .email(request.getEmail())
                .message("OTP sent to your email")
                .build(), "OTP sent to your email"));
    }

    @PostMapping("/signup/otp/verify")
    @Operation(summary = "Verify signup OTP and complete registration", description = "Verifies OTP and completes registration")
    public ResponseEntity<ApiResponse<AuthResponse>> signupVerifyOtp(
            @RequestParam String email,
            @RequestParam String otpCode,
            @RequestParam String name,
            @RequestParam String password,
            @RequestParam(required = false) String mobile) {
        otpService.verifyOtp(new OtpVerificationRequest(email, otpCode, OtpType.SIGNUP));
        
        if (!otpService.isOtpVerified(email, OtpType.SIGNUP)) {
            throw new BadRequestException("OTP verification failed");
        }
        
        SignupRequest signupRequest = new SignupRequest(name, email, password, mobile);
        UserDTO user = authService.signup(signupRequest);
        AuthResponse response = authService.login(email, password);
        return ResponseEntity.ok(ApiResponse.of(response, "Registration and login successful"));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates user and returns JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.loginWithOtp(request);
        return ResponseEntity.ok(ApiResponse.of(response, "OTP sent to your email"));
    }

    @PostMapping("/otp/generate")
    @Operation(summary = "Generate OTP for login", description = "Sends OTP to user's email for login verification")
    public ResponseEntity<ApiResponse<OtpResponse>> generateLoginOtp(@Valid @RequestBody OtpRequest request) {
        OtpResponse response = authService.generateOtp(request);
        return ResponseEntity.ok(ApiResponse.of(response, "OTP sent to your email"));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify OTP", description = "Verifies the OTP code sent to email")
    public ResponseEntity<ApiResponse<OtpResponse>> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        OtpResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.of(response, "OTP verified successfully"));
    }

    @PostMapping("/verify-otp-login")
    @Operation(summary = "Complete login with OTP", description = "Generates JWT token after successful OTP verification")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtpLogin(@RequestParam String email) {
        AuthResponse response = authService.loginWithVerifiedOtp(email);
        return ResponseEntity.ok(ApiResponse.of(response, "Login successful"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Sends OTP to email for password reset")
    public ResponseEntity<ApiResponse<OtpResponse>> forgotPassword(@Valid @RequestBody OtpRequest request) {
        request.setOtpType(OtpType.PASSWORD_RESET);
        OtpResponse response = authService.generateOtp(request);
        return ResponseEntity.ok(ApiResponse.of(response, "Password reset OTP sent to your email"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with OTP", description = "Verifies OTP and resets the user's password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestParam String email,
                                                              @RequestParam String otpCode,
                                                              @RequestParam String newPassword) {
        authService.resetPassword(email, otpCode, newPassword);
        return ResponseEntity.ok(ApiResponse.of(null, "Password reset successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the currently authenticated user's details")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        UserDTO user = authService.getUserById(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.of(user));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update profile", description = "Updates the current user's profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestBody UpdateProfileRequest request) {
        UserDTO user = authService.updateProfile(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.of(user, "Profile updated successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Invalidates the current JWT token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String token) {
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.of(null, "Logout successful"));
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate token", description = "Validates if a token is valid and not blacklisted")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(
            @RequestHeader(value = "Authorization", required = false) String token) {
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(ApiResponse.of(isValid));
    }
}