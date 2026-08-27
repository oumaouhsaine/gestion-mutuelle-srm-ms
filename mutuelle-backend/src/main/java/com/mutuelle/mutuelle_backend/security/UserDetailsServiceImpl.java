package com.mutuelle.mutuelle_backend.security;

import com.mutuelle.mutuelle_backend.model.User;
import com.mutuelle.mutuelle_backend.repository.UserRepository;
import com.mutuelle.mutuelle_backend.repository.AgentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    AgentRepository agentRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Try to find user directly by email (username)
        User user = userRepository.findByUsername(username).orElse(null);

        // 2. If not found, try to find via Agent matricule
        if (user == null) {
            user = agentRepository.findByMatricule(username)
                    .map(agent -> {
                        if (agent.getIdUser() != null) {
                            return userRepository.findById(agent.getIdUser()).orElse(null);
                        }
                        return null;
                    })
                    .orElse(null);
        }

        if (user == null) {
            throw new UsernameNotFoundException("User Not Found with username or matricule: " + username);
        }

        return UserDetailsImpl.build(user);
    }
}
