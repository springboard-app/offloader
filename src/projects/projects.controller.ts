import { Controller } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { Crud } from "@nestjsx/crud";
import { Project } from "./project.entity";

@Crud({
  model: {
    type: Project
  },
  params: {
    id: {
      field: "id",
      primary: true,
      type: "uuid"
    }
  },
  routes: {
    exclude: ["createManyBase"]
  }
})
@Controller("projects")
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}
}
