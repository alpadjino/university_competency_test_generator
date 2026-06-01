import { Competencies } from "./Competencies";
import { Test } from "./Tests";
import { Question } from "./Agent";

Competencies.belongsToMany(Test, {
  through: 'test_competencies',
  foreignKey: 'competency_id',
  otherKey: 'test_id',
  timestamps: false,
});

Test.belongsToMany(Competencies, {
  through: 'test_competencies',
  foreignKey: 'test_id',
  otherKey: 'competency_id',
  as: { singular: 'competency', plural: 'competencies' },
  timestamps: false,
});

Test.hasMany(Question, { 
  foreignKey: 'testId', 
  onDelete: 'CASCADE',
  hooks: true
});


