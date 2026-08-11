package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.CommentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentSpringDataRepository extends JpaRepository<CommentJpaEntity, UUID> {
    List<CommentJpaEntity> findByPostId(UUID postId);
}
