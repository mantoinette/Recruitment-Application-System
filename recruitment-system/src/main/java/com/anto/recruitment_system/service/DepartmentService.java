package com.anto.recruitment_system.service;

import com.anto.recruitment_system.entity.Department;
import com.anto.recruitment_system.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public List<Department> getActiveDepartments() {
        return departmentRepository.findByActiveTrueOrderByNameAsc();
    }

    public Department createDepartment(Department department) {
        if (department.getName() == null || department.getName().isBlank()) {
            throw new IllegalArgumentException("Department name is required");
        }

        department.setName(department.getName().trim());
        if (department.getDescription() != null) {
            department.setDescription(department.getDescription().trim());
        }

        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, Department updated) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        if (updated.getName() == null || updated.getName().isBlank()) {
            throw new IllegalArgumentException("Department name is required");
        }

        department.setName(updated.getName().trim());
        department.setDescription(updated.getDescription());
        department.setActive(updated.isActive());
        return departmentRepository.save(department);
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }
}
