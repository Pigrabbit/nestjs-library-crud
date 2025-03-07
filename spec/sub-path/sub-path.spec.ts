import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import _ from 'lodash';

import { SubPathModule } from './sub-path.module';
import { TestHelper } from '../test.helper';

describe('Subpath', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [SubPathModule()],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await TestHelper.dropTypeOrmEntityTables();
        await app?.close();
    });

    it('should be provided methods', async () => {
        const routerPathList = TestHelper.getRoutePath(app.getHttpServer());
        const expected: Record<string, string[]> = {
            get: ['/:parentId/child/:id', '/:parentId/child', '/:parentId/sub/:subId/child/:id', '/:parentId/sub/:subId/child'],
            post: [
                '/:parentId/child',
                '/:parentId/child/:id/recover',
                '/:parentId/child/search',
                '/:parentId/sub/:subId/child',
                '/:parentId/sub/:subId/child/:id/recover',
                '/:parentId/sub/:subId/child/search',
            ],
            patch: ['/:parentId/child/:id', '/:parentId/sub/:subId/child/:id'],
            delete: ['/:parentId/child/:id', '/:parentId/sub/:subId/child/:id'],
            put: ['/:parentId/child/:id', '/:parentId/sub/:subId/child/:id'],
        };
        for (const [method, path] of Object.entries(expected)) {
            expect(routerPathList[method]).toHaveLength(path.length);
            expect(routerPathList[method]).toEqual(expect.arrayContaining(path));
        }
    });
});
