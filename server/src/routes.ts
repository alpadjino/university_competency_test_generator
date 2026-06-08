/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TestsController } from './controllers/TestsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { QuestionsController } from './controllers/QuestionsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GenerationTasksController } from './controllers/GenerationTasksController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CompetenciesController } from './controllers/CompetenciesController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './controllers/AuthController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AgentController } from './controllers/AgentController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "TestAttributes": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "status": {"dataType":"string","required":true},
            "files": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TestViewModel": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "status": {"dataType":"string","required":true},
            "files": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SetTitleRequest": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SetDescriptionRequest": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SetCompetenciesRequest": {
        "dataType": "refObject",
        "properties": {
            "competenciesId": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionCategory": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["A"]},{"dataType":"enum","enums":["B"]},{"dataType":"enum","enums":["C"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["Closed"]},{"dataType":"enum","enums":["Open"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ClosedQuestionSubtype": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["One"]},{"dataType":"enum","enums":["Multiple"]},{"dataType":"enum","enums":["Matching"]},{"dataType":"enum","enums":["CorrectSequence"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OpenQuestionSubtype": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["DetailedAnswer"]},{"dataType":"enum","enums":["Addition"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChoiceOptionsDb": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"isTrue":{"dataType":"boolean","required":true},"text":{"dataType":"string","required":true}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchingOptionsDb": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"right":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"text":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},"required":true},"left":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"text":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},"required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SequenceOptionsDb": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"text":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionOptionsDb": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"ChoiceOptionsDb"},{"ref":"MatchingOptionsDb"},{"ref":"SequenceOptionsDb"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerationStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["queued"]},{"dataType":"enum","enums":["generating"]},{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["failed"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionsGeneratedResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"generationStatus":{"dataType":"union","subSchemas":[{"ref":"GenerationStatus"},{"dataType":"enum","enums":[null]}],"required":true},"order":{"dataType":"double","required":true},"testId":{"dataType":"double","required":true},"standardAnswer":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"question":{"dataType":"string","required":true},"options":{"ref":"QuestionOptionsDb","required":true},"subtype":{"dataType":"union","subSchemas":[{"ref":"ClosedQuestionSubtype"},{"ref":"OpenQuestionSubtype"}],"required":true},"type":{"ref":"QuestionType","required":true},"category":{"ref":"QuestionCategory","required":true},"text":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionsGeneratedListResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"QuestionsGeneratedResponse"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerationTaskResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"updatedAt":{"dataType":"datetime","required":true},"createdAt":{"dataType":"datetime","required":true},"errorMessage":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"status":{"ref":"GenerationStatus","required":true},"promptText":{"dataType":"string","required":true},"testId":{"dataType":"double","required":true},"questionId":{"dataType":"double","required":true},"id":{"dataType":"double","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerationTaskListResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"GenerationTaskResponse"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompetenciesResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateCompetenciesRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerateQuestionsEnqueueResponse": {
        "dataType": "refObject",
        "properties": {
            "questionIds": {"dataType":"array","array":{"dataType":"double"},"required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerateQuestionsRequest": {
        "dataType": "refObject",
        "properties": {
            "questionsCount": {"dataType":"double","required":true},
            "testId": {"dataType":"double","required":true},
            "questionsType": {"ref":"QuestionType","required":true},
            "questionsSubType": {"dataType":"union","subSchemas":[{"ref":"ClosedQuestionSubtype"},{"ref":"OpenQuestionSubtype"}],"required":true},
            "promptText": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsTestsController_get: Record<string, TsoaRoute.ParameterSchema> = {
                testId: {"in":"path","name":"testId","required":true,"dataType":"double"},
        };
        app.get('/api/tests/:testId/get',
            ...(fetchMiddlewares<RequestHandler>(TestsController)),
            ...(fetchMiddlewares<RequestHandler>(TestsController.prototype.get)),

            async function TestsController_get(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTestsController_get, request, response });

                const controller = new TestsController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTestsController_setTitle: Record<string, TsoaRoute.ParameterSchema> = {
                testId: {"in":"path","name":"testId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"SetTitleRequest"},
        };
        app.post('/api/tests/:testId/set-title',
            ...(fetchMiddlewares<RequestHandler>(TestsController)),
            ...(fetchMiddlewares<RequestHandler>(TestsController.prototype.setTitle)),

            async function TestsController_setTitle(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTestsController_setTitle, request, response });

                const controller = new TestsController();

              await templateService.apiHandler({
                methodName: 'setTitle',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTestsController_setDescription: Record<string, TsoaRoute.ParameterSchema> = {
                testId: {"in":"path","name":"testId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"SetDescriptionRequest"},
        };
        app.post('/api/tests/:testId/set-description',
            ...(fetchMiddlewares<RequestHandler>(TestsController)),
            ...(fetchMiddlewares<RequestHandler>(TestsController.prototype.setDescription)),

            async function TestsController_setDescription(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTestsController_setDescription, request, response });

                const controller = new TestsController();

              await templateService.apiHandler({
                methodName: 'setDescription',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTestsController_addCompetency: Record<string, TsoaRoute.ParameterSchema> = {
                testId: {"in":"path","name":"testId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"SetCompetenciesRequest"},
        };
        app.post('/api/tests/:testId/add-competency',
            ...(fetchMiddlewares<RequestHandler>(TestsController)),
            ...(fetchMiddlewares<RequestHandler>(TestsController.prototype.addCompetency)),

            async function TestsController_addCompetency(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTestsController_addCompetency, request, response });

                const controller = new TestsController();

              await templateService.apiHandler({
                methodName: 'addCompetency',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTestsController_removeCompetency: Record<string, TsoaRoute.ParameterSchema> = {
                testId: {"in":"path","name":"testId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"SetCompetenciesRequest"},
        };
        app.post('/api/tests/:testId/remove-competency',
            ...(fetchMiddlewares<RequestHandler>(TestsController)),
            ...(fetchMiddlewares<RequestHandler>(TestsController.prototype.removeCompetency)),

            async function TestsController_removeCompetency(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTestsController_removeCompetency, request, response });

                const controller = new TestsController();

              await templateService.apiHandler({
                methodName: 'removeCompetency',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTestsController_create: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.post('/api/tests/create',
            ...(fetchMiddlewares<RequestHandler>(TestsController)),
            ...(fetchMiddlewares<RequestHandler>(TestsController.prototype.create)),

            async function TestsController_create(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTestsController_create, request, response });

                const controller = new TestsController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTestsController_list: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/tests/list',
            ...(fetchMiddlewares<RequestHandler>(TestsController)),
            ...(fetchMiddlewares<RequestHandler>(TestsController.prototype.list)),

            async function TestsController_list(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTestsController_list, request, response });

                const controller = new TestsController();

              await templateService.apiHandler({
                methodName: 'list',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTestsController_delete: Record<string, TsoaRoute.ParameterSchema> = {
                testId: {"in":"path","name":"testId","required":true,"dataType":"double"},
        };
        app.delete('/api/tests/:testId/delete',
            ...(fetchMiddlewares<RequestHandler>(TestsController)),
            ...(fetchMiddlewares<RequestHandler>(TestsController.prototype.delete)),

            async function TestsController_delete(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTestsController_delete, request, response });

                const controller = new TestsController();

              await templateService.apiHandler({
                methodName: 'delete',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsQuestionsController_list: Record<string, TsoaRoute.ParameterSchema> = {
                testId: {"in":"path","name":"testId","required":true,"dataType":"double"},
        };
        app.get('/api/tests/:testId/questions/list',
            ...(fetchMiddlewares<RequestHandler>(QuestionsController)),
            ...(fetchMiddlewares<RequestHandler>(QuestionsController.prototype.list)),

            async function QuestionsController_list(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsQuestionsController_list, request, response });

                const controller = new QuestionsController();

              await templateService.apiHandler({
                methodName: 'list',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsQuestionsController_changeCategory: Record<string, TsoaRoute.ParameterSchema> = {
                questionId: {"in":"path","name":"questionId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"category":{"ref":"QuestionCategory","required":true}}},
        };
        app.patch('/api/tests/:testId/questions/:questionId/change-category',
            ...(fetchMiddlewares<RequestHandler>(QuestionsController)),
            ...(fetchMiddlewares<RequestHandler>(QuestionsController.prototype.changeCategory)),

            async function QuestionsController_changeCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsQuestionsController_changeCategory, request, response });

                const controller = new QuestionsController();

              await templateService.apiHandler({
                methodName: 'changeCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsQuestionsController_changeOptions: Record<string, TsoaRoute.ParameterSchema> = {
                questionId: {"in":"path","name":"questionId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"options":{"ref":"QuestionOptionsDb","required":true}}},
        };
        app.patch('/api/tests/:testId/questions/:questionId/change-options',
            ...(fetchMiddlewares<RequestHandler>(QuestionsController)),
            ...(fetchMiddlewares<RequestHandler>(QuestionsController.prototype.changeOptions)),

            async function QuestionsController_changeOptions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsQuestionsController_changeOptions, request, response });

                const controller = new QuestionsController();

              await templateService.apiHandler({
                methodName: 'changeOptions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsQuestionsController_changeQuestionText: Record<string, TsoaRoute.ParameterSchema> = {
                questionId: {"in":"path","name":"questionId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"question":{"dataType":"string","required":true}}},
        };
        app.patch('/api/tests/:testId/questions/:questionId/change-question',
            ...(fetchMiddlewares<RequestHandler>(QuestionsController)),
            ...(fetchMiddlewares<RequestHandler>(QuestionsController.prototype.changeQuestionText)),

            async function QuestionsController_changeQuestionText(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsQuestionsController_changeQuestionText, request, response });

                const controller = new QuestionsController();

              await templateService.apiHandler({
                methodName: 'changeQuestionText',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsQuestionsController_changeStandardAnswer: Record<string, TsoaRoute.ParameterSchema> = {
                questionId: {"in":"path","name":"questionId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"standardAnswer":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true}}},
        };
        app.patch('/api/tests/:testId/questions/:questionId/change-standard-answer',
            ...(fetchMiddlewares<RequestHandler>(QuestionsController)),
            ...(fetchMiddlewares<RequestHandler>(QuestionsController.prototype.changeStandardAnswer)),

            async function QuestionsController_changeStandardAnswer(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsQuestionsController_changeStandardAnswer, request, response });

                const controller = new QuestionsController();

              await templateService.apiHandler({
                methodName: 'changeStandardAnswer',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGenerationTasksController_list: Record<string, TsoaRoute.ParameterSchema> = {
                testId: {"in":"path","name":"testId","required":true,"dataType":"double"},
        };
        app.get('/api/tests/:testId/generation-tasks/list',
            ...(fetchMiddlewares<RequestHandler>(GenerationTasksController)),
            ...(fetchMiddlewares<RequestHandler>(GenerationTasksController.prototype.list)),

            async function GenerationTasksController_list(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGenerationTasksController_list, request, response });

                const controller = new GenerationTasksController();

              await templateService.apiHandler({
                methodName: 'list',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCompetenciesController_list: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/competencies/list',
            ...(fetchMiddlewares<RequestHandler>(CompetenciesController)),
            ...(fetchMiddlewares<RequestHandler>(CompetenciesController.prototype.list)),

            async function CompetenciesController_list(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCompetenciesController_list, request, response });

                const controller = new CompetenciesController();

              await templateService.apiHandler({
                methodName: 'list',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCompetenciesController_create: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"CreateCompetenciesRequest"},
        };
        app.post('/api/competencies/create',
            ...(fetchMiddlewares<RequestHandler>(CompetenciesController)),
            ...(fetchMiddlewares<RequestHandler>(CompetenciesController.prototype.create)),

            async function CompetenciesController_create(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCompetenciesController_create, request, response });

                const controller = new CompetenciesController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"password":{"dataType":"string","required":true},"username":{"dataType":"string","required":true}}},
        };
        app.post('/api/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.login)),

            async function AuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_register: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"password":{"dataType":"string","required":true},"username":{"dataType":"string","required":true}}},
        };
        app.post('/api/auth/register',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.register)),

            async function AuthController_register(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_register, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'register',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAgentController_generate: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"GenerateQuestionsRequest"},
        };
        app.post('/api/agent/generate',
            ...(fetchMiddlewares<RequestHandler>(AgentController)),
            ...(fetchMiddlewares<RequestHandler>(AgentController.prototype.generate)),

            async function AgentController_generate(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAgentController_generate, request, response });

                const controller = new AgentController();

              await templateService.apiHandler({
                methodName: 'generate',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
