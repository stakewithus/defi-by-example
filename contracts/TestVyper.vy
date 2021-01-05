 # @version ^0.2

stored_data: uint256

@external
def setData(new_value: uint256):
    self.stored_data = new_value

@external
@view
def get() -> uint256:
    return self.stored_data