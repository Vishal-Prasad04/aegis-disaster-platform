package com.aegis.backend.util;

import com.aegis.backend.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserPrincipal currentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return null;
        }
        return principal;
    }

    public static String currentUserId() {
        UserPrincipal principal = currentPrincipal();
        return principal != null ? principal.getId() : null;
    }
}
