package com.pharmacy.identity.repository;

import com.pharmacy.identity.entity.OtpVerification;
import com.pharmacy.identity.entity.OtpVerification.OtpStatus;
import com.pharmacy.identity.entity.OtpVerification.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
            String email, OtpType otpType, OtpStatus status);

    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.email = :email AND o.otpType = :otpType")
    void deleteByEmailAndOtpType(@Param("email") String email, @Param("otpType") OtpType otpType);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.status = 'EXPIRED' WHERE o.expiresAt < CURRENT_TIMESTAMP")
    void expireAllOldOtps();
}