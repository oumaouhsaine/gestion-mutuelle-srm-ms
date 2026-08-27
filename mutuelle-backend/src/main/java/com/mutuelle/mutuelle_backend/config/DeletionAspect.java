package com.mutuelle.mutuelle_backend.config;

import com.mutuelle.mutuelle_backend.service.DeletedItemService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class DeletionAspect {

    @Autowired
    private DeletedItemService deletedItemService;

    @Before("@annotation(org.springframework.web.bind.annotation.DeleteMapping) && args(id,..)")
    public void beforeDelete(JoinPoint joinPoint, Long id) {
        try {
            String controllerName = joinPoint.getTarget().getClass().getSimpleName();
            if ("DeletedItemController".equals(controllerName)) {
                return; // Do not archive recovery center's own purges
            }
            deletedItemService.archiveEntity(controllerName, id);
        } catch (Exception e) {
            System.err.println("AOP Archiving failed before delete: " + e.getMessage());
        }
    }
}
