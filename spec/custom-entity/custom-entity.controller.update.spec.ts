import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { CustomEntity } from './custom-entity.entity';
import { CustomEntityModule } from './custom-entity.module';
import { CustomEntityService } from './custom-entity.service';
import { TestHelper } from '../test.helper';

describe('CustomEntity - Update', () => {
    let app: INestApplication;
    let service: CustomEntityService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CustomEntityModule, TestHelper.getTypeOrmMysqlModule([CustomEntity])],
        }).compile();
        app = moduleFixture.createNestApplication();

        service = moduleFixture.get<CustomEntityService>(CustomEntityService);
        await Promise.all(['name1', 'name2'].map((name: string) => service.repository.save(service.repository.create({ name }))));

        await app.init();
    });

    afterEach(async () => {
        await TestHelper.dropTypeOrmEntityTables();
        await app?.close();
    });

    describe('UPDATE_ONE', () => {
        it('should be provided /:uuid', async () => {
            const routerPathList = TestHelper.getRoutePath(app.getHttpServer());
            expect(routerPathList.patch).toEqual(expect.arrayContaining(['/base/:uuid']));
        });

        it('updates one entity', async () => {
            const oldName = 'name1';
            const created = await request(app.getHttpServer()).post('/base').send({ name: oldName }).expect(HttpStatus.CREATED);
            expect(created.body.name).toEqual(oldName);

            const newName = 'name2';
            await request(app.getHttpServer())
                .patch(`/base/${created.body.uuid}`)
                .send({ name: newName })
                .expect(HttpStatus.UNPROCESSABLE_ENTITY);

            await request(app.getHttpServer()).patch(`/base/${created.body.uuid}`).send({}).expect(HttpStatus.OK);

            const descriptions = 'descriptions';
            await request(app.getHttpServer()).patch(`/base/${created.body.uuid}`).send({ descriptions }).expect(HttpStatus.OK);

            const response = await request(app.getHttpServer()).get(`/base/${created.body.uuid}`).expect(HttpStatus.OK);
            expect(response.body.name).not.toEqual(newName);
            expect(response.body.descriptions).toEqual(descriptions);
        });
    });
});
