package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.PostJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostSpringDataRepository extends JpaRepository<PostJpaEntity, UUID> {
    List<PostJpaEntity> findByTagsContainingIgnoreCase(String tag);
}
