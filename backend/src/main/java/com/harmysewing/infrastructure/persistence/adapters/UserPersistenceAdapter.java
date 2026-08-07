package com.harmysewing.infrastructure.persistence.adapters;

import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.persistence.entities.UserJpaEntity;
import com.harmysewing.infrastructure.persistence.mappers.UserPersistenceMapper;
import com.harmysewing.infrastructure.persistence.repositories.UserSpringDataRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class UserPersistenceAdapter implements UserRepositoryPort {

    private final UserSpringDataRepository userSpringDataRepository;

    public UserPersistenceAdapter(UserSpringDataRepository userSpringDataRepository) {
        this.userSpringDataRepository = userSpringDataRepository;
    }

    @Override
    public User save(User user) {
        UserJpaEntity entity = UserPersistenceMapper.toJpaEntity(user);
        UserJpaEntity savedEntity = userSpringDataRepository.save(entity);
        return UserPersistenceMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return userSpringDataRepository.findById(id)
                .map(UserPersistenceMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userSpringDataRepository.findByEmail(email)
                .map(UserPersistenceMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userSpringDataRepository.existsByEmail(email);
    }
}
