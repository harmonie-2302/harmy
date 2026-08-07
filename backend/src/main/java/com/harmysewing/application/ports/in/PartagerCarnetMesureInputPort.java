package com.harmysewing.application.ports.in;

import com.harmysewing.domain.models.PartageCarnet;

import java.util.UUID;

public interface PartagerCarnetMesureInputPort {

    record Command(
            UUID carnetMesureId,
            UUID couturiereId,
            UUID demandeurId
    ) {}

    PartageCarnet executer(Command command);
}
