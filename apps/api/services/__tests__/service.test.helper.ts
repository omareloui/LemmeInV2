import { Tester } from "../../helpers/index.ts";

import { BaseService } from "../index.ts";

export class ServiceTester<
  ServiceType extends typeof BaseService,
> extends Tester {
  service: ServiceType;
  createdRecordId: string | null;

  constructor(
    public serviceName: string,
    Service: ServiceType,
    public userId = "testing_user_id",
  ) {
    super(`service/${serviceName}:`);
    this.service = Service;
    this.createdRecordId = null;
  }

  public testCreate(data: Record<string, unknown>) {
    this.test(`should create ${this.serviceName}`, async () => {
      if (!this.service.create)
        throw new Error("This service doesn't have createForMe");
      const createdRecord = await this.service.create(data);
      this.createdRecordId = createdRecord.id.toString();
      this.shouldMatch(this.createdRecordId, /^[\da-f]{24}$/);
    });
  }

  public testGetAll() {
    this.test(`should get all ${this.serviceName}`, async () => {
      if (!this.createdRecordId)
        throw new Error("No record was provided to test deleting");
      if (!this.service.getAll)
        throw new Error("This service doesn't have getOne");
      const records = await this.service.getAll();
      this.shouldHaveProperty(records[0], "id");
    });
  }

  public testGetOne() {
    this.test(`should get the created ${this.serviceName}`, async () => {
      if (!this.createdRecordId)
        throw new Error("No record was provided to test getting it");
      if (!this.service.getOne)
        throw new Error("This service doesn't have getOne");
      const record = await this.service.getOne(this.createdRecordId);
      this.shouldHaveProperty(record, "id");
    });
  }

  public testUpdateOne(newData: Record<string, unknown>) {
    this.test(`should update the created ${this.serviceName}`, async () => {
      if (!this.createdRecordId)
        throw new Error("No record was provided to test updating");
      if (!this.service.updateOne)
        throw new Error("This service doesn't have updateOne");
      const newRecord = await this.service.updateOne(
        this.createdRecordId,
        newData,
      );
      this.shouldHaveSameObjectPropertiesWValue(newData, newRecord);
    });
  }

  public testRemovingOne() {
    this.test("should delete the created password", async () => {
      if (!this.createdRecordId)
        throw new Error("No record was provided to test deleting");
      if (!this.service.removeOne)
        throw new Error("This service doesn't have removeOne");
      const result = await this.service.removeOne(this.createdRecordId);
      this.shouldEquals(result, true);
    });
  }

  public testCreateMine(data: Record<string, unknown>) {
    this.test(`should create ${this.serviceName}`, async () => {
      if (!this.service.createMine)
        throw new Error("This service doesn't have createForMe");
      const createdRecord = await this.service.createMine(data, this.userId);
      this.createdRecordId = createdRecord.id.toString();
      this.shouldMatch(this.createdRecordId, /^[\da-f]{24}$/);
    });
  }

  public testGetAllMine() {
    this.test(`should get all my ${this.serviceName}`, async () => {
      if (!this.service.getAllMine)
        throw new Error("This service doesn't have getOneMine");
      const records = await this.service.getAllMine(this.userId);
      this.shouldHaveProperty(records[0], "id");
    });
  }

  public testGetOneMine() {
    this.test(`should get the created ${this.serviceName}`, async () => {
      if (!this.createdRecordId)
        throw new Error("No record was provided to test getting it");
      if (!this.service.getOneMine)
        throw new Error("This service doesn't have getOneMine");
      const record = await this.service.getOneMine(
        this.createdRecordId,
        this.userId,
      );
      this.shouldHaveProperty(record, "id");
    });
  }

  public testUpdateOneMine(newData: Record<string, unknown>) {
    this.test(`should update the created ${this.serviceName}`, async () => {
      if (!this.createdRecordId)
        throw new Error("No record was provided to test updating");
      if (!this.service.updateOneMine)
        throw new Error("This service doesn't have updateOneMine");
      const newRecord = await this.service.updateOneMine(
        this.createdRecordId,
        newData,
        this.userId,
      );
      this.shouldHaveSameObjectPropertiesWValue(newData, newRecord);
    });
  }

  public testRemovingOneMine() {
    this.test("should delete the created password", async () => {
      if (!this.createdRecordId)
        throw new Error("No record was provided to test deleting");
      if (!this.service.removeOneMine)
        throw new Error("This service doesn't have removeOneMine");
      const result = await this.service.removeOneMine(
        this.createdRecordId,
        this.userId,
      );
      this.shouldEquals(result, true);
    });
  }
}
