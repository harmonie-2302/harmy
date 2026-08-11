package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.ReportJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReportSpringDataRepository extends JpaRepository<ReportJpaEntity, UUID> {
}
