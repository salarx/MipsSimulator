# MIPS Simulator

## Supported MIPS Instructions
- [Add](#add)
- [Addi](#addi)
- [Sub](#sub)
- [Slt](#slt)
- [Lw](#lw)
- [Sw](#sw)
- [Beq](#beq)
- [Bne](#bne)

## Add
add rd, rs, rt
rd = rs + rt
0000 00ss ssst tttt dddd d000 0010 0000

## Addi
addi rs, rt, imm
rt = rs + imm
0010 00ss ssst tttt iiii iiii iiii iiii

## Sub
sub rd, rs, rt
rd = rs - rt
0000 00ss ssst tttt dddd d000 0010 0010

## Slt
slt rd, rs, rt
if rs is less than rt, then rd = 1 else rd = 0
0000 00ss ssst tttt dddd d000 0010 1010 

## Lw
lw rt, offset(rs)
rt = *(int*)(offset+rs)
1000 11ss ssst tttt iiii iiii iiii iiii

## Sw
sw rt, offset(rs)
*(int*)(offset+rs) = rt
1010 11ss ssst tttt iiii iiii iiii iiii

## Beq
beq rs, rt, offset
if(rs == rt) pc += offset * 4
0001 00ss ssst tttt iiii iiii iiii iiii

## Bne
bne rs, rt, offset
0001 01ss ssst tttt iiii iiii iiii iiii
if(rs != rt) pc += offset * 4
