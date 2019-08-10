import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectsModule } from "./projects/projects.module";
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(require(`../${process.env.ORM_CONFIG}`)),
    ProjectsModule,
    JobsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
