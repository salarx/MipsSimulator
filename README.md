# MIPS Simulator

## Supported MIPS Instructions
- [Add - Add (with overflow)](#Add - Add (with overflow))
- [Addi - Add Immediate (with overflow)](#Addi - Add Immediate (with overflow))
- [Sub - Subtract](#Sub - Subtract)
- [Slt - Set on Less Than (signed)](#Slt - Set on Less Than (signed))
- [Lw - Load Word](#Lw - Load Word)
- [Sw - Store Word](#Sw - Store Word)
- [Beq - Branch on Equal](#Beq - Branch on Equal)
- [Bne - Branch on Not Equal](#Bne - Branch on Not Equal)

## Add - Add (with overflow)
add rd, rs, rt  
rd = rs + rt  
0000 00ss ssst tttt dddd d000 0010 0000

## Addi - Add Immediate (with overflow)
addi rs, rt, imm  
rt = rs + imm  
0010 00ss ssst tttt iiii iiii iiii iiii

## Sub - Subtract
sub rd, rs, rt  
rd = rs - rt  
0000 00ss ssst tttt dddd d000 0010 0010

## Slt - Set on Less Than (signed)
slt rd, rs, rt  
if(rs < rt) rd = 1 else rd = 0  
0000 00ss ssst tttt dddd d000 0010 1010 

## Lw - Load Word
lw rt, offset(rs)  
rt = *(int*)(offset+rs)  
1000 11ss ssst tttt iiii iiii iiii iiii

## Sw - Store Word
sw rt, offset(rs)  
*(int*)(offset+rs) = rt  
1010 11ss ssst tttt iiii iiii iiii iiii

## Beq - Branch on Equal
beq rs, rt, offset  
if(rs == rt) pc += offset * 4  
0001 00ss ssst tttt iiii iiii iiii iiii

## Bne - Branch on Not Equal
bne rs, rt, offset  
if(rs != rt) pc += offset * 4  
0001 01ss ssst tttt iiii iiii iiii iiii  

