# MIPS Simulator

## Supported MIPS Instructions
- [Add](#add)
- [Addi (Add Immediate)](#addi)
- [Sub](#sub)
- [Slt (Set on Less Than (signed))](#slt)
- [Lw (Load Word)](#lw)
- [Sw (Store Word)](#sw)
- [Beq (Branch on Equal)](#beq)
- [Bne (Branch on Not Equal)](#bne)

## Add
add rd, rs, rt  
rd = rs + rt  
0000 00ss ssst tttt dddd d000 0010 0000

## Addi (Add Immediate)
addi rs, rt, imm  
rt = rs + imm  
0010 00ss ssst tttt iiii iiii iiii iiii

## Sub
sub rd, rs, rt  
rd = rs - rt  
0000 00ss ssst tttt dddd d000 0010 0010

## Slt (Set on Less Than (signed))
slt rd, rs, rt  
if(rs < rt) rd = 1 else rd = 0  
0000 00ss ssst tttt dddd d000 0010 1010 

## Lw (Load Word)
lw rt, offset(rs)  
rt = *(int*)(offset+rs)  
1000 11ss ssst tttt iiii iiii iiii iiii

## Sw (Store Word)
sw rt, offset(rs)  
*(int*)(offset+rs) = rt  
1010 11ss ssst tttt iiii iiii iiii iiii

## Beq (Branch on Equal)
beq rs, rt, offset  
if(rs == rt) pc += offset * 4  
0001 00ss ssst tttt iiii iiii iiii iiii

## Bne (Branch on Not Equal)
bne rs, rt, offset  
if(rs != rt) pc += offset * 4  
0001 01ss ssst tttt iiii iiii iiii iiii  

